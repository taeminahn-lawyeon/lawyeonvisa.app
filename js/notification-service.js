// ============================================
// SNS 알림 서비스
// 쓰레드 메시지 알림을 사용자의 선호 메신저로 발송
// ============================================

// Supabase Edge Function URL (배포 후 설정)
const NOTIFICATION_FUNCTION_URL = 'https://gqistzsergddnpcvuzba.supabase.co/functions/v1/send-notification';

// 알림 템플릿 (이미지와 동일한 카드 스타일)
const NOTIFICATION_TEMPLATES = {
    // 새 답변 알림
    new_reply: {
        ko: {
            title: '서비스 문의 알림',
            header: '답변이 추가되었어요',
            footer: '본 메시지는 고객님의 요청에 의해서 발송됩니다.',
            button: '답변 확인하기'
        },
        en: {
            title: 'Service Inquiry Alert',
            header: 'A new reply has been added',
            footer: 'This message is sent at your request.',
            button: 'Check Reply'
        }
    },
    // 서류 요청 알림
    document_request: {
        ko: {
            title: '서류 요청 알림',
            header: '추가 서류가 필요합니다',
            footer: '본 메시지는 고객님의 요청에 의해서 발송됩니다.',
            button: '서류 제출하기'
        },
        en: {
            title: 'Document Request',
            header: 'Additional documents are required',
            footer: 'This message is sent at your request.',
            button: 'Submit Documents'
        }
    },
    // 기본사항 제출 요청
    profile_request: {
        ko: {
            title: '기본사항 제출 요청',
            header: '기본 정보를 입력해주세요',
            footer: '본 메시지는 고객님의 요청에 의해서 발송됩니다.',
            button: '기본사항 제출하기'
        },
        en: {
            title: 'Profile Submission Request',
            header: 'Please submit your basic information',
            footer: 'This message is sent at your request.',
            button: 'Submit Profile'
        }
    },
    // 진행 상태 업데이트
    status_update: {
        ko: {
            title: '진행 상태 알림',
            header: '진행 상태가 업데이트되었습니다',
            footer: '본 메시지는 고객님의 요청에 의해서 발송됩니다.',
            button: '상태 확인하기'
        },
        en: {
            title: 'Status Update',
            header: 'Your application status has been updated',
            footer: 'This message is sent at your request.',
            button: 'Check Status'
        }
    }
};

/**
 * SNS 알림 발송
 * @param {Object} params - 알림 파라미터
 * @param {string} params.userId - 수신자 사용자 ID
 * @param {string} params.threadId - 쓰레드 ID
 * @param {string} params.templateType - 알림 템플릿 타입 (new_reply, document_request, etc.)
 * @param {string} params.serviceName - 서비스명
 * @param {string} params.messagePreview - 메시지 미리보기 (선택)
 * @param {string} params.language - 언어 (ko/en, 기본: en)
 */
async function sendSnsNotification(params) {
    try {
        console.log('📱 [sendSnsNotification] 알림 발송 시작:', params);

        const {
            userId,
            threadId,
            templateType = 'new_reply',
            serviceName,
            messagePreview = '',
            language = 'en'
        } = params;

        // 사용자 프로필에서 메신저 정보 가져오기
        const profileResult = await getUserProfile(userId);
        if (!profileResult.success || !profileResult.data) {
            console.log('📱 [sendSnsNotification] 프로필 없음 - 알림 스킵');
            return { success: false, error: 'Profile not found' };
        }

        const profile = profileResult.data;
        const messenger = profile.preferred_messenger;
        const messengerId = profile.messenger_id;

        if (!messenger || !messengerId) {
            console.log('📱 [sendSnsNotification] 메신저 정보 없음 - 알림 스킵');
            return { success: false, error: 'Messenger info not configured' };
        }

        // 템플릿 가져오기
        const template = NOTIFICATION_TEMPLATES[templateType];
        if (!template) {
            console.error('📱 [sendSnsNotification] 유효하지 않은 템플릿:', templateType);
            return { success: false, error: 'Invalid template type' };
        }

        const localizedTemplate = template[language] || template['en'];

        // 쓰레드 URL 생성
        const threadUrl = `${window.location.origin}/my-threads.html?thread=${threadId}`;

        // 알림 페이로드 구성
        const notificationPayload = {
            messenger: messenger,
            recipient: messengerId,
            template: {
                title: localizedTemplate.title,
                header: localizedTemplate.header,
                serviceName: serviceName,
                messagePreview: messagePreview,
                footer: localizedTemplate.footer,
                buttonText: localizedTemplate.button,
                buttonUrl: threadUrl
            }
        };

        console.log('📱 [sendSnsNotification] 알림 페이로드:', notificationPayload);

        // Supabase Edge Function 호출
        const session = await checkSession();
        if (!session) {
            console.error('📱 [sendSnsNotification] 세션 없음');
            return { success: false, error: 'Not authenticated' };
        }

        const response = await fetch(NOTIFICATION_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify(notificationPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('📱 [sendSnsNotification] Edge Function 오류:', errorText);
            return { success: false, error: errorText };
        }

        const result = await response.json();
        console.log('📱 [sendSnsNotification] 알림 발송 성공:', result);
        return { success: true, data: result };

    } catch (error) {
        console.error('📱 [sendSnsNotification] 오류:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 관리자가 메시지를 보낼 때 알림 발송
 * @param {string} threadId - 쓰레드 ID
 * @param {string} messageContent - 메시지 내용
 */
async function notifyUserOnNewMessage(threadId, messageContent) {
    try {
        console.log('📱 [notifyUserOnNewMessage] 새 메시지 알림 처리');

        // 쓰레드 정보 가져오기
        const threadResult = await getThread(threadId);
        if (!threadResult.success || !threadResult.data) {
            console.error('📱 [notifyUserOnNewMessage] 쓰레드 조회 실패');
            return { success: false, error: 'Thread not found' };
        }

        const thread = threadResult.data;

        // 메시지 미리보기 (최대 100자)
        const messagePreview = messageContent.length > 100
            ? messageContent.substring(0, 100) + '...'
            : messageContent;

        // 알림 발송
        return await sendSnsNotification({
            userId: thread.user_id,
            threadId: threadId,
            templateType: 'new_reply',
            serviceName: thread.service_name,
            messagePreview: messagePreview,
            language: 'en' // 외국인 대상이므로 영어 기본
        });

    } catch (error) {
        console.error('📱 [notifyUserOnNewMessage] 오류:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 기본사항 제출 요청 알림 발송
 * @param {string} threadId - 쓰레드 ID
 */
async function notifyProfileRequest(threadId) {
    try {
        const threadResult = await getThread(threadId);
        if (!threadResult.success || !threadResult.data) {
            return { success: false, error: 'Thread not found' };
        }

        const thread = threadResult.data;

        return await sendSnsNotification({
            userId: thread.user_id,
            threadId: threadId,
            templateType: 'profile_request',
            serviceName: thread.service_name,
            language: 'en'
        });
    } catch (error) {
        console.error('📱 [notifyProfileRequest] 오류:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 서류 요청 알림 발송
 * @param {string} threadId - 쓰레드 ID
 * @param {string} documentList - 요청 서류 목록
 */
async function notifyDocumentRequest(threadId, documentList) {
    try {
        const threadResult = await getThread(threadId);
        if (!threadResult.success || !threadResult.data) {
            return { success: false, error: 'Thread not found' };
        }

        const thread = threadResult.data;

        return await sendSnsNotification({
            userId: thread.user_id,
            threadId: threadId,
            templateType: 'document_request',
            serviceName: thread.service_name,
            messagePreview: documentList,
            language: 'en'
        });
    } catch (error) {
        console.error('📱 [notifyDocumentRequest] 오류:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 진행 상태 업데이트 알림 발송
 * @param {string} threadId - 쓰레드 ID
 * @param {string} newStatus - 새 상태
 */
async function notifyStatusUpdate(threadId, newStatus) {
    try {
        const threadResult = await getThread(threadId);
        if (!threadResult.success || !threadResult.data) {
            return { success: false, error: 'Thread not found' };
        }

        const thread = threadResult.data;

        // 상태 한글/영어 매핑
        const statusMessages = {
            'document': 'Documents pending / 서류 대기 중',
            'review': 'Under review / 검토 중',
            'submitted': 'Submitted to immigration / 출입국 제출 완료',
            'approved': 'Approved! / 승인 완료',
            'completed': 'Service completed / 서비스 완료'
        };

        return await sendSnsNotification({
            userId: thread.user_id,
            threadId: threadId,
            templateType: 'status_update',
            serviceName: thread.service_name,
            messagePreview: statusMessages[newStatus] || newStatus,
            language: 'en'
        });
    } catch (error) {
        console.error('📱 [notifyStatusUpdate] 오류:', error);
        return { success: false, error: error.message };
    }
}

console.log('✅ Notification Service 로드 완료');
