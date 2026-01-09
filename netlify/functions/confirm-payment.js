// 토스페이먼츠 결제 승인 API
// Netlify Serverless Function

exports.handler = async (event, context) => {
    // CORS 헤더
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // POST 요청만 허용
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { paymentKey, orderId, amount } = JSON.parse(event.body);

        // 필수 파라미터 검증
        if (!paymentKey || !orderId || !amount) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Missing required parameters',
                    message: 'paymentKey, orderId, amount는 필수입니다.'
                })
            };
        }

        // 토스페이먼츠 API 시크릿 키 (환경변수에서 가져오기)
        // TODO: Netlify 환경변수에 TOSS_SECRET_KEY 설정 필요
        const secretKey = process.env.TOSS_SECRET_KEY || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';
        
        // Base64 인코딩 (시크릿키 + ":")
        const encryptedSecretKey = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');

        console.log('💳 결제 승인 요청:', { orderId, amount, paymentKey: paymentKey.substring(0, 20) + '...' });

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
        });

        const result = await response.json();

        console.log('💳 토스페이먼츠 응답:', response.status, result);

        if (!response.ok) {
            // 결제 승인 실패
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: result.code,
                    message: result.message
                })
            };
        }

        // 결제 승인 성공
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: result
            })
        };

    } catch (error) {
        console.error('❌ 결제 승인 오류:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'INTERNAL_ERROR',
                message: error.message || '서버 오류가 발생했습니다.'
            })
        };
    }
};
