// Supabase Edge Function: SNS 알림 발송
// 지원 플랫폼: WhatsApp, Telegram, LINE, Zalo, WeChat

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// 허용된 도메인 목록
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

// 메신저별 API 설정 (환경 변수에서 로드)
const MESSENGER_CONFIGS = {
  whatsapp: {
    apiUrl: 'https://graph.facebook.com/v18.0',
    // WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN 필요
  },
  telegram: {
    apiUrl: 'https://api.telegram.org',
    // TELEGRAM_BOT_TOKEN 필요
  },
  line: {
    apiUrl: 'https://api.line.me/v2/bot/message/push',
    // LINE_CHANNEL_ACCESS_TOKEN 필요
  },
  zalo: {
    apiUrl: 'https://openapi.zalo.me/v2.0/oa/message',
    // ZALO_ACCESS_TOKEN 필요
  },
  wechat: {
    apiUrl: 'https://api.weixin.qq.com/cgi-bin/message/custom/send',
    // WECHAT_ACCESS_TOKEN 필요
  }
}

interface NotificationPayload {
  messenger: string
  recipient: string
  template: {
    title: string
    header: string
    serviceName: string
    messagePreview?: string
    footer: string
    buttonText: string
    buttonUrl: string
  }
}

// WhatsApp 메시지 발송 (Meta Business API)
async function sendWhatsApp(recipient: string, template: NotificationPayload['template']) {
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
  const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')

  if (!phoneNumberId || !accessToken) {
    throw new Error('WhatsApp API credentials not configured')
  }

  // WhatsApp Interactive Message (버튼 포함)
  const message = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipient.replace(/[^0-9]/g, ''), // 숫자만 추출
    type: 'interactive',
    interactive: {
      type: 'button',
      header: {
        type: 'text',
        text: template.title
      },
      body: {
        text: `${template.header}\n\n- Service: ${template.serviceName}\n${template.messagePreview ? `- Message: ${template.messagePreview}\n` : ''}\n${template.footer}`
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'check_reply',
              title: template.buttonText.substring(0, 20) // WhatsApp 버튼 최대 20자
            }
          }
        ]
      }
    }
  }

  const response = await fetch(
    `${MESSENGER_CONFIGS.whatsapp.apiUrl}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`WhatsApp API error: ${error}`)
  }

  return await response.json()
}

// Telegram 메시지 발송
async function sendTelegram(recipient: string, template: NotificationPayload['template']) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')

  if (!botToken) {
    throw new Error('Telegram Bot Token not configured')
  }

  // Telegram 인라인 버튼 메시지
  const message = {
    chat_id: recipient,
    text: `*${template.title}*\n\n${template.header}\n\n📋 Service: ${template.serviceName}\n${template.messagePreview ? `💬 ${template.messagePreview}\n` : ''}\n_${template.footer}_`,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: template.buttonText,
            url: template.buttonUrl
          }
        ]
      ]
    }
  }

  const response = await fetch(
    `${MESSENGER_CONFIGS.telegram.apiUrl}/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Telegram API error: ${error}`)
  }

  return await response.json()
}

// LINE 메시지 발송
async function sendLine(recipient: string, template: NotificationPayload['template']) {
  const channelAccessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')

  if (!channelAccessToken) {
    throw new Error('LINE Channel Access Token not configured')
  }

  // LINE Flex Message (카드 스타일)
  const message = {
    to: recipient,
    messages: [
      {
        type: 'flex',
        altText: template.header,
        contents: {
          type: 'bubble',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: template.title,
                weight: 'bold',
                size: 'lg',
                color: '#1DB446'
              }
            ],
            backgroundColor: '#F0FFF0'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: template.header,
                weight: 'bold',
                size: 'md',
                wrap: true
              },
              {
                type: 'separator',
                margin: 'lg'
              },
              {
                type: 'box',
                layout: 'vertical',
                margin: 'lg',
                contents: [
                  {
                    type: 'text',
                    text: `- Service: ${template.serviceName}`,
                    size: 'sm',
                    wrap: true
                  },
                  ...(template.messagePreview ? [{
                    type: 'text',
                    text: `- Message: ${template.messagePreview}`,
                    size: 'sm',
                    wrap: true,
                    margin: 'sm'
                  }] : [])
                ]
              },
              {
                type: 'text',
                text: template.footer,
                size: 'xs',
                color: '#888888',
                margin: 'lg',
                wrap: true
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: template.buttonText,
                  uri: template.buttonUrl
                },
                style: 'primary',
                color: '#1DB446'
              }
            ]
          }
        }
      }
    ]
  }

  const response = await fetch(MESSENGER_CONFIGS.line.apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${channelAccessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`LINE API error: ${error}`)
  }

  return { success: true }
}

// Zalo 메시지 발송
async function sendZalo(recipient: string, template: NotificationPayload['template']) {
  const accessToken = Deno.env.get('ZALO_ACCESS_TOKEN')

  if (!accessToken) {
    throw new Error('Zalo Access Token not configured')
  }

  // Zalo 메시지 (버튼 포함)
  const message = {
    recipient: {
      user_id: recipient
    },
    message: {
      text: `${template.title}\n\n${template.header}\n\n📋 Service: ${template.serviceName}\n${template.messagePreview ? `💬 ${template.messagePreview}\n` : ''}\n${template.footer}`,
      attachment: {
        type: 'template',
        payload: {
          buttons: [
            {
              title: template.buttonText,
              payload: template.buttonUrl,
              type: 'oa.open.url'
            }
          ]
        }
      }
    }
  }

  const response = await fetch(MESSENGER_CONFIGS.zalo.apiUrl, {
    method: 'POST',
    headers: {
      'access_token': accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Zalo API error: ${error}`)
  }

  return await response.json()
}

// WeChat 메시지 발송
async function sendWeChat(recipient: string, template: NotificationPayload['template']) {
  const accessToken = Deno.env.get('WECHAT_ACCESS_TOKEN')

  if (!accessToken) {
    throw new Error('WeChat Access Token not configured')
  }

  // WeChat 텍스트 메시지 (링크 포함)
  const message = {
    touser: recipient,
    msgtype: 'news',
    news: {
      articles: [
        {
          title: template.header,
          description: `📋 Service: ${template.serviceName}\n${template.messagePreview ? template.messagePreview : ''}\n\n${template.footer}`,
          url: template.buttonUrl,
          picurl: '' // 썸네일 URL (선택)
        }
      ]
    }
  }

  const response = await fetch(
    `${MESSENGER_CONFIGS.wechat.apiUrl}?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`WeChat API error: ${error}`)
  }

  return await response.json()
}

// 메인 핸들러
serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: NotificationPayload = await req.json()
    console.log('📱 Notification request:', payload)

    const { messenger, recipient, template } = payload

    if (!messenger || !recipient || !template) {
      throw new Error('Missing required fields: messenger, recipient, template')
    }

    let result

    switch (messenger.toLowerCase()) {
      case 'whatsapp':
        result = await sendWhatsApp(recipient, template)
        break
      case 'telegram':
        result = await sendTelegram(recipient, template)
        break
      case 'line':
        result = await sendLine(recipient, template)
        break
      case 'zalo':
        result = await sendZalo(recipient, template)
        break
      case 'wechat':
        result = await sendWeChat(recipient, template)
        break
      case 'kakaotalk':
        // 카카오톡은 현재 지원하지 않음 (외국인 대상)
        return new Response(
          JSON.stringify({ success: false, error: 'KakaoTalk is not supported for foreign users' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      default:
        throw new Error(`Unsupported messenger: ${messenger}`)
    }

    console.log('📱 Notification sent successfully:', result)

    // 알림 기록 저장 (선택)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    await supabase.from('notification_logs').insert({
      messenger: messenger,
      recipient: recipient,
      template_type: template.title,
      status: 'sent',
      sent_at: new Date().toISOString()
    }).catch(err => console.log('Notification log error:', err))

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('📱 Notification error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
