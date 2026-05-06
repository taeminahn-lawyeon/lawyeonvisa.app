// Supabase Edge Function: 어드민 이메일 알림 (Resend)
// 트리거: 신규 쓰레드 생성 / 고객의 새 메시지 등록
// 수신: ADMIN_EMAIL 단일 주소

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
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

const FROM_EMAIL = 'Law Firm Lawyeon <noreply@lawyeonvisa.app>'
const ADMIN_EMAIL = 'taemin.ahn@lawyeon.com'
const SITE_URL = 'https://lawyeonvisa.app'

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

    const { threadId, eventType } = await req.json()
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
      .select('id, user_id, service_name')
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
      // new_message: 첫 고객 메시지는 new_thread 이벤트와 중복되므로 skip
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', threadId)
        .eq('sender_type', 'user')

      if (typeof count === 'number' && count <= 1) {
        console.log(`📧 First user message — skipping admin email (count=${count})`)
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: 'First user message covered by new_thread event' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      subject = `[Lawyeon] ${customerName}의 ${serviceName} 건 문의 등록`
      messageText = `${customerName}의 ${serviceName} 건 문의가 등록 되었습니다.`
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
