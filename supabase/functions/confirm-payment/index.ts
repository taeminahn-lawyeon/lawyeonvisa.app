// 토스페이먼츠 결제 승인 API (보안 강화 버전)
// Supabase Edge Function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// 허용된 도메인 목록
const ALLOWED_ORIGINS = [
  'https://lawyeonvisa.app',
  'https://www.lawyeonvisa.app',
  'http://localhost:3000',  // 개발 환경
  'http://127.0.0.1:3000'
]

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-idempotency-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  }
}

// 처리된 결제 키를 저장 (중복 방지)
const processedPayments = new Set<string>()

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // POST 메서드만 허용
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'METHOD_NOT_ALLOWED', message: 'POST 메서드만 허용됩니다.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // 1. 인증 토큰 검증
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'UNAUTHORIZED', message: '인증이 필요합니다.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Supabase 클라이언트로 토큰 검증
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase 환경변수 누락')
      throw new Error('서버 설정 오류')
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('❌ 인증 실패:', authError)
      return new Response(
        JSON.stringify({ success: false, error: 'INVALID_TOKEN', message: '유효하지 않은 인증 토큰입니다.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ 인증 성공:', user.id)

    // 2. 요청 본문 파싱
    const { paymentKey, orderId, amount } = await req.json()

    // 3. 필수 파라미터 검증
    if (!paymentKey || !orderId || !amount) {
      return new Response(
        JSON.stringify({ success: false, error: 'MISSING_PARAMETERS', message: 'paymentKey, orderId, amount는 필수입니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. 파라미터 타입 및 형식 검증
    if (typeof paymentKey !== 'string' || paymentKey.length < 10) {
      return new Response(
        JSON.stringify({ success: false, error: 'INVALID_PAYMENT_KEY', message: 'paymentKey 형식이 올바르지 않습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (typeof orderId !== 'string' || !orderId.match(/^[A-Za-z0-9\-_]+$/)) {
      return new Response(
        JSON.stringify({ success: false, error: 'INVALID_ORDER_ID', message: 'orderId 형식이 올바르지 않습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const numericAmount = Number(amount)
    if (isNaN(numericAmount) || numericAmount <= 0 || numericAmount > 100000000) {
      return new Response(
        JSON.stringify({ success: false, error: 'INVALID_AMOUNT', message: '금액이 올바르지 않습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. 중복 결제 승인 방지 (Idempotency)
    const idempotencyKey = req.headers.get('x-idempotency-key') || paymentKey
    if (processedPayments.has(idempotencyKey)) {
      console.warn('⚠️ 중복 결제 요청 감지:', idempotencyKey)
      return new Response(
        JSON.stringify({ success: false, error: 'DUPLICATE_REQUEST', message: '이미 처리된 결제 요청입니다.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. 토스페이먼츠 시크릿 키 (환경변수 필수)
    const secretKey = Deno.env.get('TOSS_SECRET_KEY')
    if (!secretKey) {
      console.error('❌ TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다')
      return new Response(
        JSON.stringify({ success: false, error: 'SERVER_CONFIG_ERROR', message: '서버 설정 오류입니다. 관리자에게 문의하세요.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Base64 인코딩 (시크릿키 + ":")
    const encryptedSecretKey = 'Basic ' + btoa(secretKey + ':')

    // 로깅 (민감 정보 마스킹)
    console.log('💳 결제 승인 요청:', {
      orderId,
      amount: numericAmount,
      userId: user.id,
      paymentKeyPrefix: paymentKey.substring(0, 8) + '***'
    })

    // 7. 토스페이먼츠 결제 승인 API 호출
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': encryptedSecretKey,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey  // 토스페이먼츠 측 중복 방지
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: numericAmount
      })
    })

    const result = await response.json()

    console.log('💳 토스페이먼츠 응답:', response.status)

    if (!response.ok) {
      // 결제 승인 실패 - 상세 에러 로깅
      console.error('❌ 토스페이먼츠 승인 실패:', {
        status: response.status,
        code: result.code,
        message: result.message
      })

      return new Response(
        JSON.stringify({
          success: false,
          error: result.code || 'PAYMENT_FAILED',
          message: result.message || '결제 승인에 실패했습니다.'
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 8. 결제 승인 성공 - 처리 완료 표시
    processedPayments.add(idempotencyKey)

    // 메모리 정리 (오래된 항목 제거 - 24시간 후)
    setTimeout(() => processedPayments.delete(idempotencyKey), 24 * 60 * 60 * 1000)

    // 9. 결제 정보 DB 저장 (선택적)
    try {
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      if (serviceRoleKey) {
        const adminSupabase = createClient(supabaseUrl, serviceRoleKey)
        await adminSupabase.from('payment_logs').insert({
          user_id: user.id,
          order_id: orderId,
          payment_key: paymentKey,
          amount: numericAmount,
          status: 'confirmed',
          toss_response: result,
          created_at: new Date().toISOString()
        }).catch(err => console.log('결제 로그 저장 실패 (무시):', err.message))
      }
    } catch (logError) {
      console.log('결제 로그 저장 실패 (무시):', logError)
    }

    console.log('✅ 결제 승인 성공:', { orderId, amount: numericAmount })

    // 결제 승인 성공 응답
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          orderId: result.orderId,
          totalAmount: result.totalAmount,
          method: result.method,
          status: result.status,
          approvedAt: result.approvedAt,
          orderName: result.orderName
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ 결제 승인 오류:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
