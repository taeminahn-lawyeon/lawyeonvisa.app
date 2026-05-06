// Supabase Edge Function: Email notification via Resend
// Sent to customer when admin replies to their consultation thread

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

const FROM_EMAIL = 'Law Firm Lawyeon <noreply@lawyeon.com>'
const SITE_URL = 'https://lawyeonvisa.app'
const SUBJECT = '[Lawyeon Visa & Immigration Center] You have a new message regarding your consultation'

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]!))
}

function buildHtmlBody(name: string, threadUrl: string): string {
  const safeName = escapeHtml(name)
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,Helvetica,sans-serif;color:#333;line-height:1.6;font-size:15px;max-width:600px;margin:0 auto;padding:20px;">
  <p>Hi ${safeName},</p>
  <p>You have a new message from your visa specialist regarding your pre consultation.</p>
  <p>Please check your consultation thread to review the message and respond.</p>
  <p>👉&nbsp;&nbsp;<a href="${threadUrl}" style="color:#1a73e8;text-decoration:underline;">View your thread</a></p>
  <p>If you have any questions, you can reply directly in the thread.</p>
  <p style="margin-top:24px;">Law Firm Lawyeon<br>Visa &amp; Immigration Center</p>
</body>
</html>`
}

function buildTextBody(name: string, threadUrl: string): string {
  return `Hi ${name},

You have a new message from your visa specialist regarding your pre consultation.

Please check your consultation thread to review the message and respond.

👉  View your thread: ${threadUrl}

If you have any questions, you can reply directly in the thread.

Law Firm Lawyeon
Visa & Immigration Center`
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

    const { threadId } = await req.json()
    if (!threadId) {
      throw new Error('Missing required field: threadId')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    const { data: thread, error: threadErr } = await supabase
      .from('threads')
      .select('id, user_id')
      .eq('id', threadId)
      .single()

    if (threadErr || !thread) {
      throw new Error(`Thread not found: ${threadErr?.message || 'no data'}`)
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', thread.user_id)
      .single()

    if (profileErr || !profile) {
      throw new Error(`Profile not found: ${profileErr?.message || 'no data'}`)
    }

    if (!profile.email) {
      console.log('📧 Customer has no email - skipping')
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'No email on profile' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const threadUrl = `${SITE_URL}/thread-general-v2.html?id=${thread.id}`
    const customerName = profile.name || 'there'

    const html = buildHtmlBody(customerName, threadUrl)
    const text = buildTextBody(customerName, threadUrl)

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: profile.email,
        subject: SUBJECT,
        html,
        text,
      }),
    })

    const resendBody = await resendRes.json()

    await supabase.from('notification_logs').insert({
      messenger: 'email',
      recipient: profile.email,
      template_type: 'new_reply_email',
      status: resendRes.ok ? 'sent' : 'failed',
      sent_at: new Date().toISOString()
    }).catch((err) => console.log('notification_logs insert error:', err))

    if (!resendRes.ok) {
      console.error('📧 Resend error:', resendBody)
      return new Response(
        JSON.stringify({ success: false, error: resendBody }),
        { status: resendRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('📧 Email sent:', resendBody.id, '→', profile.email)
    return new Response(
      JSON.stringify({ success: true, id: resendBody.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('📧 Email function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
