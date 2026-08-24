// Supabase Edge Function: 어드민 이메일 알림 (Resend)
// 트리거: 신규 쓰레드 생성 / 고객의 새 메시지 등록
// 수신: ADMIN_EMAIL 단일 주소

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://www.lawyeon-immigration.com',
  'https://lawyeon-immigration.com',
  'https://lawyeonvisa.app',
  'https://www.lawyeonvisa.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

// 발신 도메인은 Resend 에 인증된 도메인이어야 한다. lawyeon-immigration.com 의
// 인증(SPF·DKIM)이 끝난 뒤에 noreply@lawyeon-immigration.com 으로 바꾼다.
const FROM_EMAIL = 'Law Firm Lawyeon <noreply@lawyeonvisa.app>'
// 담당자가 바뀔 수 있으므로 함수 시크릿으로 덮어쓸 수 있게 한다.
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'taemin.ahn@lawyeon.com'
const SITE_URL = 'https://www.lawyeon-immigration.com'

function buildHtml(message: string, threadUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Apple SD Gothic Neo','Malgun Gothic',Arial,sans-serif;color:#333;line-height:1.6;font-size:15px;max-width:600px;margin:0 auto;padding:20px;">
  <p>${message}</p>
  <p><a href="${threadUrl}" style="color:#1a73e8;text-decoration:underline;">${threadUrl}</a></p>
</body>
</html>`
}

function buildText(message: string, threadUrl: string): string {
  return `${message}\n\n${threadUrl}`
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const body = await req.json()

    // ===== 방문 예약(booking) 신규 알림 분기 =====
    // 예약은 비로그인(anon) 방문자도 접수하므로 service role 로 조회해 메일 발송.
    if (body && (body.type === 'reservation' || body.reservationId)) {
      const reservationId = body.reservationId
      if (!reservationId) {
        throw new Error('Missing required field: reservationId')
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, serviceKey)

      const { data: r, error: rErr } = await supabase
        .from('reservations')
        .select('id, name, phone, office, topic, reserve_date, reserve_time, memo, lang, created_at')
        .eq('id', reservationId)
        .single()

      if (rErr || !r) {
        throw new Error(`Reservation not found: ${rErr?.message || 'no data'}`)
      }

      const adminUrl = `${SITE_URL}/admin-dashboard.html#reservations`
      const subject = `[Lawyeon] 방문 예약 신규 — ${r.name} (${r.reserve_date} ${r.reserve_time})`
      const lines = [
        `${r.name}님이 방문 상담을 예약하셨습니다.`,
        ``,
        `· 날짜/시간: ${r.reserve_date} ${r.reserve_time}`,
        `· 사무소: ${r.office || '-'}`,
        `· 분야: ${r.topic || '-'}`,
        `· 연락처: ${r.phone || '-'}`,
      ]
      if (r.memo) lines.push(`· 내용: ${r.memo}`)
      const messageText = lines.join('\n')
      const html = buildHtml(messageText.replace(/\n/g, '<br>'), adminUrl)
      const text = buildText(messageText, adminUrl)

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: FROM_EMAIL, to: ADMIN_EMAIL, subject, html, text }),
      })
      const resendBody = await resendRes.json()

      try {
        await supabase.from('notification_logs').insert({
          messenger: 'email',
          recipient: ADMIN_EMAIL,
          template_type: 'admin_new_reservation',
          status: resendRes.ok ? 'sent' : 'failed',
          sent_at: new Date().toISOString()
        })
      } catch (err) {
        console.log('notification_logs insert error:', err)
      }

      if (!resendRes.ok) {
        console.error('📧 Resend error (reservation):', resendBody)
        return new Response(
          JSON.stringify({ success: false, error: resendBody }),
          { status: resendRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('📧 Admin email sent (reservation):', resendBody.id)
      return new Response(
        JSON.stringify({ success: true, id: resendBody.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ===== 온라인 사전상담(Pre-consultation) 접수 분기 =====
    // 상담 쓰레드를 대체하는 경로. 비로그인(anon) 접수이므로 service role 로 재조회한다.
    // 예약·기업자문과 같은 단순 알림 메일이다. 회신은 담당자가 본문의 신청자
    // 이메일 주소를 보고 직접 새 메일을 보내는 방식으로 처리한다.
    if (body && (body.type === 'pre_consultation' || body.preConsultationId)) {
      const preConsultationId = body.preConsultationId
      if (!preConsultationId) {
        throw new Error('Missing required field: preConsultationId')
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, serviceKey)

      const { data: c, error: cErr } = await supabase
        .from('pre_consultations')
        .select('id, name, email, phone, category, in_korea, visa, visa_expiry, country, message, lang, created_at')
        .eq('id', preConsultationId)
        .single()

      if (cErr || !c) {
        throw new Error(`Pre-consultation not found: ${cErr?.message || 'no data'}`)
      }

      const adminUrl = `${SITE_URL}/admin-dashboard.html#preConsultations`
      const subject = `[Lawyeon] 사전상담 신청 — ${c.name}${c.category ? ' (' + c.category + ')' : ''}`

      // Stay 한 줄은 국내/해외에 따라 붙는 정보가 달라진다.
      const stay = c.in_korea
        ? 'KR' + (c.visa ? ` / ${c.visa}` : '') + (c.visa_expiry ? ` / expires ${c.visa_expiry}` : '')
        : 'Abroad' + (c.country ? ` / ${c.country}` : '')

      const lines = [
        `[Consultation request]`,
        `· Category: ${c.category || '-'}`,
        `· Stay: ${stay}`,
        `· Name: ${c.name}`,
        `· Email: ${c.email}`,
        `· Phone: ${c.phone || '-'}`,
      ]
      if (c.message) lines.push(`· Message: ${c.message}`)
      const messageText = lines.join('\n')
      // 본문의 신청자 주소는 눌러서 바로 새 메일을 쓸 수 있게 mailto 로 건다.
      const htmlBody = messageText
        .replace(/\n/g, '<br>')
        .replace(
          `· Email: ${c.email}`,
          `· Email: <a href="mailto:${c.email}?subject=${encodeURIComponent('[법무법인 로연] 사전상담 회신 — ' + c.name)}">${c.email}</a>`
        )
      const html = buildHtml(htmlBody, adminUrl)
      const text = buildText(messageText, adminUrl)

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: FROM_EMAIL, to: ADMIN_EMAIL, subject, html, text }),
      })
      const resendBody = await resendRes.json()

      try {
        await supabase.from('notification_logs').insert({
          messenger: 'email',
          recipient: ADMIN_EMAIL,
          template_type: 'admin_new_pre_consultation',
          status: resendRes.ok ? 'sent' : 'failed',
          sent_at: new Date().toISOString()
        })
      } catch (err) {
        console.log('notification_logs insert error:', err)
      }

      if (!resendRes.ok) {
        console.error('📧 Resend error (pre_consultation):', resendBody)
        return new Response(
          JSON.stringify({ success: false, error: resendBody }),
          { status: resendRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('📧 Admin email sent (pre_consultation):', resendBody.id)
      return new Response(
        JSON.stringify({ success: true, id: resendBody.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ===== 기업 자문(Corporate Advisory) 신규 문의 알림 분기 =====
    // 문의는 비로그인(anon) 방문자도 접수하므로 service role 로 조회해 메일 발송.
    if (body && (body.type === 'corporate_inquiry' || body.inquiryId)) {
      const inquiryId = body.inquiryId
      if (!inquiryId) {
        throw new Error('Missing required field: inquiryId')
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, serviceKey)

      const { data: q, error: qErr } = await supabase
        .from('corporate_inquiries')
        .select('id, name, company, phone, email, message, lang, created_at')
        .eq('id', inquiryId)
        .single()

      if (qErr || !q) {
        throw new Error(`Corporate inquiry not found: ${qErr?.message || 'no data'}`)
      }

      const adminUrl = `${SITE_URL}/admin-dashboard.html#corporate-inquiries`
      const subject = `[Lawyeon] 기업 자문 문의 신규 — ${q.name}${q.company ? ' (' + q.company + ')' : ''}`
      const lines = [
        `${q.name}님이 기업 자문을 문의하셨습니다.`,
        ``,
        `· 회사/기관: ${q.company || '-'}`,
        `· 연락처: ${q.phone || '-'}`,
        `· 이메일: ${q.email || '-'}`,
      ]
      if (q.message) lines.push(`· 내용: ${q.message}`)
      const messageText = lines.join('\n')
      const html = buildHtml(messageText.replace(/\n/g, '<br>'), adminUrl)
      const text = buildText(messageText, adminUrl)

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: FROM_EMAIL, to: ADMIN_EMAIL, subject, html, text }),
      })
      const resendBody = await resendRes.json()

      try {
        await supabase.from('notification_logs').insert({
          messenger: 'email',
          recipient: ADMIN_EMAIL,
          template_type: 'admin_new_corporate_inquiry',
          status: resendRes.ok ? 'sent' : 'failed',
          sent_at: new Date().toISOString()
        })
      } catch (err) {
        console.log('notification_logs insert error:', err)
      }

      if (!resendRes.ok) {
        console.error('📧 Resend error (corporate_inquiry):', resendBody)
        return new Response(
          JSON.stringify({ success: false, error: resendBody }),
          { status: resendRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('📧 Admin email sent (corporate_inquiry):', resendBody.id)
      return new Response(
        JSON.stringify({ success: true, id: resendBody.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ===== 기존: 쓰레드 신규/답글 알림 =====
    const { threadId, eventType } = body
    if (!threadId || !eventType) {
      throw new Error('Missing required fields: threadId, eventType')
    }
    if (eventType !== 'new_thread' && eventType !== 'new_message') {
      throw new Error(`Invalid eventType: ${eventType}`)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    const { data: thread, error: threadErr } = await supabase
      .from('threads')
      .select('id, user_id, service_name, created_at')
      .eq('id', threadId)
      .single()

    if (threadErr || !thread) {
      throw new Error(`Thread not found: ${threadErr?.message || 'no data'}`)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', thread.user_id)
      .single()

    const customerName = (profile && profile.name) || '(이름 미등록)'
    const serviceName = thread.service_name || '(서비스 미지정)'
    const threadUrl = `${SITE_URL}/admin-thread.html?id=${thread.id}`

    let subject: string
    let messageText: string

    if (eventType === 'new_thread') {
      subject = `[Lawyeon] ${customerName}의 ${serviceName} 쓰레드 신규 생성`
      messageText = `${customerName}의 ${serviceName} 쓰레드 신청이 신규 생성 되었습니다.`
    } else {
      // new_message 이벤트는 createMessage() 에서 sender_type='user' 일 때만 호출됨
      // (자동 폼 제출 — D-10 신청서, 결제 메시지 등 — 은 직접 .insert() 하므로 이 이벤트를 트리거하지 않음)
      // 따라서 모든 new_message 는 고객이 답글 폼에서 직접 댓글 등록한 것 → 무조건 메일 발송
      subject = `[Lawyeon] ${customerName}의 ${serviceName} 쓰레드 답글 등록`
      messageText = `${customerName}님이 ${serviceName} 쓰레드에 답글을 등록하셨습니다.`
    }

    const html = buildHtml(messageText, threadUrl)
    const text = buildText(messageText, threadUrl)

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject,
        html,
        text,
      }),
    })

    const resendBody = await resendRes.json()

    try {
      await supabase.from('notification_logs').insert({
        messenger: 'email',
        recipient: ADMIN_EMAIL,
        template_type: `admin_${eventType}`,
        status: resendRes.ok ? 'sent' : 'failed',
        sent_at: new Date().toISOString()
      })
    } catch (err) {
      console.log('notification_logs insert error:', err)
    }

    if (!resendRes.ok) {
      console.error('📧 Resend error:', resendBody)
      return new Response(
        JSON.stringify({ success: false, error: resendBody }),
        { status: resendRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📧 Admin email sent (${eventType}):`, resendBody.id)
    return new Response(
      JSON.stringify({ success: true, id: resendBody.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('📧 Admin email function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
