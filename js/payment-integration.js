// 결제 연동 모듈
// Toss Payments Global + PayPal

// ========================================
// Toss Payments Global 연동
// ========================================

// Toss Payments 클라이언트 키 (라이브)
const TOSS_CLIENT_KEY = 'live_gck_Poxy1XQL8RPY4bvZ7EMKV7nO5WmI';

// Toss Payments 초기화
let tossPayments = null;

function initTossPayments() {
    try {
        // Toss Payments SDK 로드 확인
        if (typeof TossPayments === 'undefined') {
            console.error('Toss Payments SDK가 로드되지 않았습니다');
            return false;
        }

        tossPayments = TossPayments(TOSS_CLIENT_KEY);
        console.log('✅ Toss Payments 초기화 완료');
        return true;
    } catch (error) {
        console.error('Toss Payments 초기화 실패:', error);
        return false;
    }
}

// Toss Payments Global 결제 요청
async function requestTossPayment(applicationData) {
    try {
        if (!tossPayments) {
            const initialized = initTossPayments();
            if (!initialized) {
                throw new Error('Toss Payments 초기화 실패');
            }
        }

        const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const amount = applicationData.service.displayPrice;
        const orderName = applicationData.service.name;
        const customerName = applicationData.applicant.name;
        const customerEmail = applicationData.applicant.email;

        // 결제 데이터 localStorage에 임시 저장
        sessionStorage.setItem('pending_application', JSON.stringify(applicationData));

        // Toss Payments Global 결제창 호출
        await tossPayments.requestPayment('CARD', {
            amount: amount,
            orderId: orderId,
            orderName: orderName,
            customerName: customerName,
            customerEmail: customerEmail,
            successUrl: `${window.location.origin}/payment-success.html`,
            failUrl: `${window.location.origin}/payment-fail.html`,
            // Global 결제 설정
            currency: 'KRW',
            country: 'KR',
            // 추가 옵션
            metadata: {
                serviceId: applicationData.service.id,
                applicationType: 'visa-service'
            }
        });

        return true;
    } catch (error) {
        console.error('Toss Payments 결제 요청 실패:', error);
        
        if (error.code === 'USER_CANCEL') {
            alert('결제가 취소되었습니다');
        } else if (error.code === 'INVALID_CARD') {
            alert('유효하지 않은 카드입니다');
        } else {
            alert(`결제 요청 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        }
        
        return false;
    }
}

// ========================================
// PayPal 연동
// ========================================

// PayPal 클라이언트 ID (실제 운영 시 환경변수로 관리)
const PAYPAL_CLIENT_ID = 'AaQXEKTYX_4mOy7LPiJQ7VRwVzC-9A6SWdkU-XZk5jkX8kP7kI7hLjGIKn3HEyWFPH-_xGw4rKvGxCxR';  // 테스트용

let paypalLoaded = false;

// PayPal SDK 동적 로드
function loadPayPalSDK() {
    return new Promise((resolve, reject) => {
        if (paypalLoaded) {
            resolve(true);
            return;
        }

        // PayPal SDK 스크립트 체크
        if (typeof paypal !== 'undefined') {
            paypalLoaded = true;
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=KRW`;
        script.async = true;
        
        script.onload = () => {
            paypalLoaded = true;
            console.log('✅ PayPal SDK 로드 완료');
            resolve(true);
        };

        script.onerror = () => {
            console.error('PayPal SDK 로드 실패');
            reject(new Error('PayPal SDK 로드 실패'));
        };

        document.head.appendChild(script);
    });
}

// PayPal 결제 처리
async function requestPayPalPayment(applicationData) {
    try {
        // PayPal SDK 로드
        await loadPayPalSDK();

        const amount = applicationData.service.displayPrice;
        const serviceName = applicationData.service.name;

        // PayPal 주문 생성
        const createOrder = (data, actions) => {
            return actions.order.create({
                purchase_units: [{
                    description: serviceName,
                    amount: {
                        currency_code: 'KRW',
                        value: amount.toString()
                    },
                    custom_id: applicationData.id,
                    soft_descriptor: '로이언 출입국'
                }],
                application_context: {
                    brand_name: '로이언 출입국사무소',
                    locale: 'ko-KR',
                    landing_page: 'BILLING',
                    user_action: 'PAY_NOW'
                }
            });
        };

        // PayPal 결제 승인
        const onApprove = async (data, actions) => {
            try {
                const order = await actions.order.capture();
                console.log('✅ PayPal 결제 승인:', order);

                // 결제 성공 처리
                applicationData.payment = {
                    method: 'paypal',
                    orderId: order.id,
                    status: order.status,
                    payer: order.payer,
                    amount: amount,
                    timestamp: new Date().toISOString()
                };

                saveApplication(applicationData);
                
                // 성공 페이지로 이동
                window.location.href = `payment-success.html?orderId=${order.id}`;
                
                return true;
            } catch (error) {
                console.error('PayPal 결제 승인 실패:', error);
                alert('결제 처리 중 오류가 발생했습니다');
                return false;
            }
        };

        // PayPal 결제 취소
        const onCancel = (data) => {
            console.log('PayPal 결제 취소:', data);
            alert('결제가 취소되었습니다');
        };

        // PayPal 결제 오류
        const onError = (err) => {
            console.error('PayPal 결제 오류:', err);
            alert('결제 처리 중 오류가 발생했습니다');
        };

        // PayPal 버튼 렌더링 (모달 방식)
        return new Promise((resolve) => {
            // 모달 생성
            const modal = document.createElement('div');
            modal.id = 'paypal-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 15px;
                max-width: 500px;
                width: 90%;
            `;

            const modalHeader = document.createElement('div');
            modalHeader.innerHTML = `
                <h2 style="margin-bottom: 20px; color: #333;">PayPal 결제</h2>
                <div id="paypal-button-container"></div>
                <button id="paypal-cancel" style="
                    margin-top: 15px;
                    width: 100%;
                    padding: 12px;
                    background: #f0f0f0;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                ">취소</button>
            `;

            modalContent.appendChild(modalHeader);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            // 취소 버튼
            document.getElementById('paypal-cancel').onclick = () => {
                document.body.removeChild(modal);
                resolve(false);
            };

            // PayPal 버튼 렌더링
            paypal.Buttons({
                createOrder: createOrder,
                onApprove: async (data, actions) => {
                    const result = await onApprove(data, actions);
                    document.body.removeChild(modal);
                    resolve(result);
                },
                onCancel: (data) => {
                    onCancel(data);
                    document.body.removeChild(modal);
                    resolve(false);
                },
                onError: (err) => {
                    onError(err);
                    document.body.removeChild(modal);
                    resolve(false);
                },
                style: {
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'pay'
                }
            }).render('#paypal-button-container');
        });

    } catch (error) {
        console.error('PayPal 결제 요청 실패:', error);
        alert('PayPal 결제 초기화에 실패했습니다');
        return false;
    }
}

// ========================================
// 공통 함수
// ========================================

// 신청 데이터 저장
function saveApplication(applicationData) {
    try {
        // localStorage에 저장
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        applications.push(applicationData);
        localStorage.setItem('applications', JSON.stringify(applications));

        console.log('✅ 신청 데이터 저장 완료:', applicationData.id);
        
        // TODO: Firebase/백엔드 API로 전송
        // await fetch('/api/applications', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(applicationData)
        // });

        return true;
    } catch (error) {
        console.error('신청 데이터 저장 실패:', error);
        return false;
    }
}

// 결제 수단에 따른 결제 처리
async function processPaymentByMethod(method, applicationData) {
    try {
        if (method === 'toss') {
            return await requestTossPayment(applicationData);
        } else if (method === 'paypal') {
            return await requestPayPalPayment(applicationData);
        } else {
            throw new Error('지원하지 않는 결제 수단입니다');
        }
    } catch (error) {
        console.error('결제 처리 실패:', error);
        return false;
    }
}

// 결제 완료 후 채팅방 생성
function createChatRoom(applicationData) {
    try {
        const chatRoom = {
            id: `CHAT-${applicationData.id}`,
            applicationId: applicationData.id,
            participants: [
                {
                    type: 'applicant',
                    name: applicationData.applicant.name,
                    email: applicationData.applicant.email
                },
                {
                    type: 'admin',
                    name: '센터장',
                    email: 'admin@lawyeon.com'
                }
            ],
            service: applicationData.service.name,
            status: 'active',
            messages: [],
            files: applicationData.files || [],
            createdAt: new Date().toISOString()
        };

        // localStorage에 채팅방 저장
        const chatRooms = JSON.parse(localStorage.getItem('chatRooms') || '[]');
        chatRooms.push(chatRoom);
        localStorage.setItem('chatRooms', JSON.stringify(chatRooms));

        console.log('✅ 채팅방 생성 완료:', chatRoom.id);
        return chatRoom;
    } catch (error) {
        console.error('채팅방 생성 실패:', error);
        return null;
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initTossPayments,
        requestTossPayment,
        requestPayPalPayment,
        processPaymentByMethod,
        saveApplication,
        createChatRoom
    };
}
