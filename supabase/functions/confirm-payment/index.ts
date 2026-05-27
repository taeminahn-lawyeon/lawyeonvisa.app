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

// 서버사이드 가격 미러본 — 클라이언트에서 위변조된 amount 차단용
// agencyFee + govFee + bundledItems 합산이 결제 amount 와 일치해야 함
// (servicePricing 의 partial 미러: 번들/특수 가격이 있는 항목 위주로 등록)
type PriceEntry = { agencyFee: number; govFee: number; bundledTotal?: number }
const SERVER_PRICE_TABLE: Record<string, PriceEntry> = {
  // 일반 D-10-1 변경 + 외국인등록증 재발급 번들
  'd10-1-change': { agencyFee: 220000, govFee: 100000, bundledTotal: 34000 },
  // FEU - D-10-1 변경 + 외국인등록증 재발급 번들
  'd10-1-feu': { agencyFee: 55000, govFee: 100000, bundledTotal: 34000 },
  // FEU - 기타
  'd10-2-feu': { agencyFee: 55000, govFee: 100000 },
  'd10-3-feu': { agencyFee: 55000, govFee: 100000 },
  'd10-t-feu': { agencyFee: 55000, govFee: 100000 },
  'd2-qualification-change-feu': { agencyFee: 55000, govFee: 100000 },
  // Chosun
  'd10-1-chosun': { agencyFee: 55000, govFee: 100000 },
  'd10-2-chosun': { agencyFee: 55000, govFee: 100000 },
  'd10-3-chosun': { agencyFee: 55000, govFee: 100000 },
  'd10-t-chosun': { agencyFee: 55000, govFee: 100000 },
  'd2-qualification-change-chosun': { agencyFee: 55000, govFee: 100000 },
}

function getExpectedTotal(serviceId: string): number | null {
  const entry = SERVER_PRICE_TABLE[serviceId]
  if (!entry) return null
  return entry.agencyFee + entry.govFee + (entry.bundledTotal || 0)
}

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
    const requestBody = await req.json()
    const { paymentKey, orderId, amount, threadData, serviceId, quoteId } = requestBody

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

    // 4-1. serviceId 가 제공된 경우 서버사이드 가격 미러본과 대조 (위변조 차단)
    if (typeof serviceId === 'string' && SERVER_PRICE_TABLE[serviceId]) {
      const expectedTotal = getExpectedTotal(serviceId)
      if (expectedTotal !== null && expectedTotal !== numericAmount) {
        console.error('🚨 금액 위변조 의심:', {
          serviceId,
          expected: expectedTotal,
          received: numericAmount,
          userId: user.id,
          orderId
        })
        // 위변조 시도 로깅 (service role 키가 있을 때)
        const logRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        if (logRoleKey) {
          try {
            const adminLog = createClient(supabaseUrl, logRoleKey)
            await adminLog.from('payment_logs').insert({
              user_id: user.id,
              order_id: orderId,
              amount: numericAmount,
              status: 'rejected_amount_mismatch',
              toss_response: { serviceId, expected: expectedTotal, received: numericAmount },
              created_at: new Date().toISOString()
            })
          } catch (_) { /* 로깅 실패는 무시 */ }
        }
        return new Response(
          JSON.stringify({ success: false, error: 'AMOUNT_MISMATCH', message: '결제 금액이 서비스 정가와 일치하지 않습니다.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // 4-2. 견적(quote) 기반 결제: 저장된 견적과 대조 (위변조/소유권/상태 검증)
    let quoteRecord: Record<string, unknown> | null = null
    if (quoteId) {
      const quoteRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      if (!quoteRoleKey) {
        console.error('❌ SERVICE_ROLE_KEY 미설정 - 견적 검증 불가')
        return new Response(
          JSON.stringify({ success: false, error: 'SERVER_CONFIG_ERROR', message: '서버 설정 오류입니다.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const adminClient = createClient(supabaseUrl, quoteRoleKey)
      const { data: quote, error: quoteError } = await adminClient
        .from('quotes')
        .select('*, threads!inner(user_id)')
        .eq('id', quoteId)
        .single()

      if (quoteError || !quote) {
        return new Response(
          JSON.stringify({ success: false, error: 'QUOTE_NOT_FOUND', message: '견적을 찾을 수 없습니다.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 소유권 검증: 견적이 속한 스레드 소유자 == 인증 사용자
      if (quote.threads?.user_id !== user.id) {
        console.error('🚨 견적 소유권 불일치:', { quoteId, owner: quote.threads?.user_id, userId: user.id })
        return new Response(
          JSON.stringify({ success: false, error: 'FORBIDDEN', message: '이 견적에 대한 결제 권한이 없습니다.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 상태/만료 검증
      if (quote.status !== 'sent') {
        return new Response(
          JSON.stringify({ success: false, error: 'QUOTE_NOT_PAYABLE', message: '이미 결제되었거나 결제할 수 없는 견적입니다.' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (quote.expires_at && new Date(quote.expires_at as string) < new Date()) {
        return new Response(
          JSON.stringify({ success: false, error: 'QUOTE_EXPIRED', message: '만료된 견적입니다.' }),
          { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 금액 위변조 검증
      if (Number(quote.total_amount) !== numericAmount) {
        console.error('🚨 견적 금액 위변조 의심:', { quoteId, expected: quote.total_amount, received: numericAmount, userId: user.id })
        return new Response(
          JSON.stringify({ success: false, error: 'AMOUNT_MISMATCH', message: '결제 금액이 견적 금액과 일치하지 않습니다.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      quoteRecord = quote
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

    // 9. 결제 정보 DB 저장 + 쓰레드 생성 (서버사이드)
    let createdThread = null
    let paidQuoteThreadId: string | null = null
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (serviceRoleKey) {
      const adminSupabase = createClient(supabaseUrl, serviceRoleKey)

      // 결제 로그 저장
      try {
        await adminSupabase.from('payment_logs').insert({
          user_id: user.id,
          order_id: orderId,
          payment_key: paymentKey,
          amount: numericAmount,
          status: 'confirmed',
          toss_response: result,
          created_at: new Date().toISOString()
        })
      } catch (logError) {
        console.log('결제 로그 저장 실패 (무시):', logError)
      }

      // 9-1. 견적 결제: quote 를 paid 처리하고 기존 스레드 금액 갱신 (신규 스레드 생성 X)
      if (quoteRecord) {
        const quoteThreadId = quoteRecord.thread_id as string
        paidQuoteThreadId = quoteThreadId
        try {
          await adminSupabase
            .from('quotes')
            .update({
              status: 'paid',
              paid_via: 'toss',
              payment_key: paymentKey,
              paid_at: new Date().toISOString()
            })
            .eq('id', quoteRecord.id as string)
            .eq('status', 'sent')  // 동시성: 이미 paid 면 갱신 안 됨

          await adminSupabase
            .from('threads')
            .update({
              amount: Number(quoteRecord.total_amount) || numericAmount,
              government_fee: Number(quoteRecord.govt_fee) || 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', quoteThreadId)
        } catch (quoteErr) {
          console.error('❌ 견적 결제 반영 오류 (결제는 성공):', quoteErr)
        }
      }
      // 10. 쓰레드 생성 (threadData가 전달된 경우 — 카탈로그 결제 흐름)
      else if (threadData && threadData.service_name) {
        try {
          console.log('🔄 쓰레드 생성 시작 (서버사이드):', {
            userId: user.id,
            serviceName: threadData.service_name,
            orderId: orderId
          })

          // 프로필 확인 및 자동 생성
          const { data: existingProfile } = await adminSupabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle()

          if (!existingProfile) {
            console.log('📋 프로필 자동 생성')
            await adminSupabase.from('profiles').upsert({
              id: user.id,
              name: threadData.customer_name || '',
              email: threadData.customer_email || user.email || '',
              phone: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' })
          }

          // 쓰레드 생성
          const threadRecord: Record<string, unknown> = {
            user_id: user.id,
            service_name: threadData.service_name,
            status: 'payment',
            amount: numericAmount,
            order_id: orderId,
            organization: threadData.organization || null,
          }

          if (threadData.government_fee) {
            threadRecord.government_fee = threadData.government_fee
          }
          if (threadData.payment_id) {
            threadRecord.payment_id = threadData.payment_id
          }

          const { data: thread, error: threadError } = await adminSupabase
            .from('threads')
            .insert(threadRecord)
            .select()
            .single()

          if (threadError) {
            console.error('❌ 쓰레드 생성 실패:', threadError)
          } else {
            createdThread = thread
            console.log('✅ 쓰레드 생성 성공:', thread.id)
          }
        } catch (threadErr) {
          console.error('❌ 쓰레드 생성 오류 (결제는 성공):', threadErr)
        }
      }
    } else {
      console.log('⚠️ SUPABASE_SERVICE_ROLE_KEY 미설정 - 결제 로그/쓰레드 생성 건너뜀')
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
          orderName: result.orderName,
          customerName: result.customerName || null,
          customerEmail: result.customerEmail || null
        },
        thread: createdThread,
        threadId: paidQuoteThreadId,
        quote: quoteRecord ? { id: quoteRecord.id, thread_id: paidQuoteThreadId } : null
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
