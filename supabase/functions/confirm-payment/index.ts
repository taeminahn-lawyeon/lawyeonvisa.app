// 토스페이먼츠 결제 승인 API
// Supabase Edge Function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { paymentKey, orderId, amount } = await req.json()

    // 필수 파라미터 검증
    if (!paymentKey || !orderId || !amount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'MISSING_PARAMETERS',
          message: 'paymentKey, orderId, amount는 필수입니다.'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 토스페이먼츠 시크릿 키 (환경변수에서 가져오기)
    const secretKey = Deno.env.get('TOSS_SECRET_KEY') || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R'
    
    // Base64 인코딩 (시크릿키 + ":")
    const encryptedSecretKey = 'Basic ' + btoa(secretKey + ':')

    console.log('💳 결제 승인 요청:', { orderId, amount, paymentKey: paymentKey.substring(0, 20) + '...' })

    // 토스페이먼츠 결제 승인 API 호출
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': encryptedSecretKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount)
      })
    })

    const result = await response.json()

    console.log('💳 토스페이먼츠 응답:', response.status)

    if (!response.ok) {
      // 결제 승인 실패
      return new Response(
        JSON.stringify({
          success: false,
          error: result.code,
          message: result.message
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 결제 승인 성공
    return new Response(
      JSON.stringify({
        success: true,
        data: result
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ 결제 승인 오류:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'INTERNAL_ERROR',
        message: error.message || '서버 오류가 발생했습니다.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
