// ============================================
// Supabase 클라이언트 초기화
// ============================================

// 프로덕션 환경에서 민감한 로그 비활성화
const IS_PRODUCTION = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
const debugLog = IS_PRODUCTION ? () => {} : console.log.bind(console);

// Supabase Dashboard → Settings → API에서 확인
const SUPABASE_URL = 'https://gqistzsergddnpcvuzba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaXN0enNlcmdkZG5wY3Z1emJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTEyMjEsImV4cCI6MjA4MDcyNzIyMX0.X_GgShObq9OJ6z7aEKdUCoyHYo-OJL-I5hcIDt4komg';

// Supabase 클라이언트 초기화
let supabaseClient;

// Supabase CDN 로드 대기
if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    window.addEventListener('DOMContentLoaded', () => {
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            console.error('Supabase CDN load failed');
        }
    });
}

// ============================================
// 인증 관련 함수
// ============================================

// Google 로그인
async function signInWithGoogle() {
    try {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        // 현재 페이지로 리디렉션
        let redirectUrl = window.location.href;

        // 페이지별 리디렉션 URL 및 universityCode 설정
        if (currentPage === 'service-apply-general.html') {
            localStorage.removeItem('universityCode');
            redirectUrl = window.location.href;
        } else if (currentPage === 'consultation-request.html') {
            localStorage.removeItem('universityCode');
            redirectUrl = window.location.href;
        } else {
            localStorage.removeItem('universityCode');
            redirectUrl = window.location.origin + '/index.html';
        }

        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl
            }
        });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Google 로그인 오류:', error);
        return { success: false, error: error.message };
    }
}

// 이메일 로그인
async function signInWithEmail(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('이메일 로그인 오류:', error);
        return { success: false, error: error.message };
    }
}

// 회원가입
async function signUpWithEmail(email, password, userData = {}) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
        
        if (error) throw error;
        
        // 프로필 생성
        if (data.user) {
            await createUserProfile(data.user.id, {
                email,
                name: userData.name || '',
                phone: userData.phone || '',
                organization: userData.organization || null
            });
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('회원가입 오류:', error);
        return { success: false, error: error.message };
    }
}

// 로그아웃
async function signOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        
        // 로컬 스토리지 정리
        localStorage.clear();
        
        // 홈으로 리디렉션
        window.location.href = 'index.html';
        
        return { success: true };
    } catch (error) {
        console.error('로그아웃 오류:', error);
        return { success: false, error: error.message };
    }
}

// 현재 사용자 정보 가져오기
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('사용자 정보 가져오기 오류:', error);
        return null;
    }
}

// 세션 확인
async function checkSession() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        return session;
    } catch (error) {
        console.error('세션 확인 오류:', error);
        return null;
    }
}

// ============================================
// 프로필 관련 함수
// ============================================

// 프로필 생성 또는 업데이트 (UPSERT)
async function createUserProfile(userId, profileData) {
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .upsert({
                id: userId,
                ...profileData,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'id'  // id가 이미 존재하면 업데이트
            })
            .select()
            .single();
        
        if (error) throw error;
        debugLog('✅ 프로필 저장 성공 (upsert):', data);
        return { success: true, data };
    } catch (error) {
        console.error('프로필 생성/업데이트 오류:', error);
        return { success: false, error: error.message };
    }
}

// 프로필 조회
async function getUserProfile(userId) {
    try {
        debugLog('프로필 조회 시도 - User ID:', userId);
        
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        debugLog('Supabase 응답 - data:', data, 'error:', error);
        
        // PGRST116 에러는 "프로필 없음"을 의미 (정상)
        if (error && error.code === 'PGRST116') {
            debugLog('프로필 없음 (PGRST116) - 정상');
            return { success: false, data: null, error: 'Profile not found' };
        }
        
        if (error) {
            console.error('Supabase 에러 상세:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            // 에러가 있어도 계속 진행 (프로필 없음으로 처리)
            return { success: false, data: null, error: error.message };
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('프로필 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

// 프로필 업데이트
async function updateUserProfile(userId, updates) {
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('프로필 업데이트 오류:', error);
        return { success: false, error: error.message };
    }
}

// 프로필 생성 또는 업데이트 (upsert)
async function createOrUpdateProfile(userId, profileData) {
    try {
        debugLog('🔄 프로필 생성/업데이트 시도:', { userId, profileData });

        const { data, error } = await supabaseClient
            .from('profiles')
            .upsert({
                id: userId,
                name: profileData.name || '',
                email: profileData.email || '',
                phone: profileData.phone || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'id'
            })
            .select()
            .single();

        if (error) {
            console.error('❌ 프로필 upsert 에러:', error);
            throw error;
        }

        debugLog('✅ 프로필 생성/업데이트 성공:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ 프로필 생성/업데이트 오류:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 쓰레드 관련 함수
// ============================================

// 쓰레드 생성
async function createThread(threadData) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            console.error('사용자 없음 - 로그인 필요');
            throw new Error('로그인이 필요합니다');
        }

        // 기본 필드만 포함 (데이터베이스 스키마에 확실히 존재하는 필드)
        const threadRecord = {
            user_id: user.id,
            service_name: threadData.service_name,
            status: threadData.status || 'received',
            amount: threadData.amount || 0,
            order_id: threadData.order_id || null,
            organization: threadData.organization || null
        };

        // 선택적 필드 추가 (존재할 수 있는 필드)
        if (threadData.government_fee) {
            threadRecord.government_fee = threadData.government_fee;
        }
        if (threadData.payment_id) {
            threadRecord.payment_id = threadData.payment_id;
        }

        debugLog('쓰레드 생성 시도:', threadRecord);

        const { data, error } = await supabaseClient
            .from('threads')
            .insert(threadRecord)
            .select()
            .single();

        if (error) {
            console.error('Supabase 쓰레드 생성 오류:', error);
            throw error;
        }

        debugLog('쓰레드 생성 성공:', data);
        return { success: true, data };
    } catch (error) {
        console.error('쓰레드 생성 실패:', error);
        return { success: false, error: error.message };
    }
}

// 사용자 쓰레드 목록 조회
async function getUserThreads(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('threads')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .neq('status', 'archived')  // 🔥 보관된 쓰레드 제외
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('쓰레드 목록 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

// 쓰레드 상태 업데이트
async function updateThreadStatus(threadId, status) {
    try {
        const { data, error } = await supabaseClient
            .from('threads')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', threadId)
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('쓰레드 상태 업데이트 오류:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 메시지 관련 함수
// ============================================

// 메시지 전송 (구버전 - 삭제됨, createMessage() 사용)
// async function sendMessage() - DEPRECATED, use createMessage() instead

// 쓰레드 메시지 조회
async function getThreadMessages(threadId) {
    try {
        debugLog('📨 [getThreadMessages] 조회 시작, threadId:', threadId);
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('thread_id', threadId)
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error('📨 [getThreadMessages] Supabase 오류:', error);
            throw error;
        }
        debugLog('📨 [getThreadMessages] 조회 성공, 개수:', data?.length || 0, '데이터:', data);
        return { success: true, data };
    } catch (error) {
        console.error('메시지 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 파일 업로드 함수
// ============================================

// 파일 업로드
async function uploadFile(bucket, filePath, file) {
    try {
        const { data, error } = await supabaseClient.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) throw error;
        
        // 공개 URL 가져오기 (avatars만 공개)
        const { data: urlData } = supabaseClient.storage
            .from(bucket)
            .getPublicUrl(filePath);
        
        return { success: true, data: { ...data, publicUrl: urlData.publicUrl } };
    } catch (error) {
        console.error('파일 업로드 오류:', error);
        return { success: false, error: error.message };
    }
}

// 파일 다운로드 URL 생성 (서명된 URL)
async function getSignedUrl(bucket, filePath, expiresIn = 3600) {
    try {
        const { data, error } = await supabaseClient.storage
            .from(bucket)
            .createSignedUrl(filePath, expiresIn);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('서명된 URL 생성 오류:', error);
        return { success: false, error: error.message };
    }
}

// 프로필 첨부파일 업로드 (외국인등록증, 여권, 전자서명)
async function uploadProfileDocument(filePath, file) {
    try {
        const { data, error } = await supabaseClient.storage
            .from('profile-documents')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });
        
        if (error) throw error;
        
        debugLog('✅ 프로필 문서 업로드 성공:', data);
        return { success: true, data };
    } catch (error) {
        console.error('프로필 문서 업로드 오류:', error);
        return { success: false, error: error.message };
    }
}

// 프로필 첨부파일 다운로드 URL 가져오기
async function getProfileDocumentUrl(filePath, expiresIn = 86400) {
    try {
        const { data, error } = await supabaseClient.storage
            .from('profile-documents')
            .createSignedUrl(filePath, expiresIn);
        
        if (error) throw error;
        return { success: true, url: data.signedUrl };
    } catch (error) {
        console.error('프로필 문서 URL 생성 오류:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 결제 관련 함수
// ============================================

// 결제 기록 저장
async function createPayment(paymentData) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('로그인이 필요합니다');
        
        debugLog('💳 결제 정보 저장 시도:', paymentData);
        
        const paymentRecord = {
            user_id: user.id,
            order_id: paymentData.order_id,
            service_name: paymentData.service_name,
            amount: paymentData.amount,
            agency_fee: paymentData.agency_fee || 0,
            govt_fee: paymentData.govt_fee || 0,
            payment_method: paymentData.payment_method,
            status: paymentData.status || 'pending',
            organization: paymentData.organization || null
        };
        
        debugLog('📝 저장할 데이터:', paymentRecord);
        
        const { data, error } = await supabaseClient
            .from('payments')
            .insert(paymentRecord);
        
        if (error) {
            console.error('❌ Supabase 오류:', error);
            throw error;
        }
        
        debugLog('✅ 결제 정보 저장 성공');
        return { success: true, data: paymentRecord };
    } catch (error) {
        console.error('❌ 결제 기록 저장 실패:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 결제 관련 추가 함수
// ============================================

// 결제 정보 조회 (단건)
async function getPayment(orderId) {
    try {
        const { data, error } = await supabaseClient
            .from('payments')
            .select('*')
            .eq('order_id', orderId)
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('결제 정보 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

// 사용자 결제 내역 조회
async function getUserPayments(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('사용자 결제 내역 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

// 결제 상태 업데이트
async function updatePaymentStatus(paymentId, status, paymentKey = null) {
    try {
        const updateData = {
            status,
            updated_at: new Date().toISOString()
        };
        
        if (paymentKey) {
            updateData.payment_key = paymentKey;
        }
        
        const { data, error } = await supabaseClient
            .from('payments')
            .update(updateData)
            .eq('id', paymentId)
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('결제 상태 업데이트 오류:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 쓰레드 관련 추가 함수
// ============================================

// 쓰레드 상세 조회
async function getThread(threadId) {
    try {
        const { data, error } = await supabaseClient
            .from('threads')
            .select('*')
            .eq('id', threadId)
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('쓰레드 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

// 모든 쓰레드 조회 (관리자용)
async function getAllThreads() {
    try {
        const { data, error } = await supabaseClient
            .from('threads')
            .select(`
                *,
                profiles!threads_user_id_fkey (
                    name,
                    email,
                    phone
                )
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ getAllThreads 에러:', error);
            throw error;
        }
        return { success: true, data };
    } catch (error) {
        console.error('전체 쓰레드 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

// 쓰레드 삭제 (소프트 삭제)
async function deleteThread(threadId) {
    try {
        const { data, error } = await supabaseClient
            .from('threads')
            .update({
                is_active: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', threadId)
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('쓰레드 삭제 오류:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 신청 내역 관련 함수
// ============================================

// 신청 내역 생성
async function createApplication(applicationData) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('로그인이 필요합니다');
        
        const { data, error } = await supabaseClient
            .from('applications')
            .insert({
                user_id: user.id,
                ...applicationData,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('신청 내역 생성 오류:', error);
        return { success: false, error: error.message };
    }
}

// 사용자 신청 내역 조회
async function getUserApplications(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('applications')
            .select('*')
            .eq('user_id', userId)
            .order('submitted_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('신청 내역 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

// 신청 상태 업데이트
async function updateApplicationStatus(applicationId, status) {
    try {
        const { data, error } = await supabaseClient
            .from('applications')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', applicationId)
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('신청 상태 업데이트 오류:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 파일 업로드/다운로드 고급 함수
// ============================================

// 쓰레드 문서 업로드 (메시지와 함께)
async function uploadThreadDocument(threadId, file) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('로그인이 필요합니다');
        
        // 파일명 생성: {threadId}/{timestamp}_{originalName}
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${threadId}/${timestamp}_${sanitizedFileName}`;
        
        debugLog('📤 파일 업로드 시작:', filePath);
        
        // Supabase Storage에 업로드
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('thread_documents')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (uploadError) {
            console.error('업로드 오류:', uploadError);
            throw uploadError;
        }
        
        debugLog('✅ 파일 업로드 성공:', uploadData);
        
        // 서명된 URL 생성 (1년 유효)
        const { data: urlData, error: urlError } = await supabaseClient.storage
            .from('thread_documents')
            .createSignedUrl(filePath, 31536000); // 1년
        
        if (urlError) throw urlError;
        
        return {
            success: true,
            data: {
                path: filePath,
                fullPath: uploadData.path,
                signedUrl: urlData.signedUrl,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            }
        };
    } catch (error) {
        console.error('문서 업로드 오류:', error);
        return { success: false, error: error.message };
    }
}

// 파일 다운로드 URL 생성 (서명된 URL)
async function getThreadDocumentUrl(filePath) {
    try {
        const { data, error } = await supabaseClient.storage
            .from('thread_documents')
            .createSignedUrl(filePath, 3600); // 1시간 유효
        
        if (error) throw error;
        return { success: true, url: data.signedUrl };
    } catch (error) {
        console.error('다운로드 URL 생성 오류:', error);
        return { success: false, error: error.message };
    }
}

// 파일 삭제
async function deleteThreadDocument(filePath) {
    try {
        const { data, error } = await supabaseClient.storage
            .from('thread_documents')
            .remove([filePath]);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('파일 삭제 오류:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 메시지 관련 함수 (파일 포함)
// ============================================

// 메시지 생성 (파일 첨부 지원 + SNS 알림)
async function createMessage(messageData) {
    try {
        debugLog('📝 [createMessage] 메시지 생성 시작:', messageData);

        const user = await getCurrentUser();
        if (!user) throw new Error('로그인이 필요합니다');
        debugLog('📝 [createMessage] 현재 사용자:', user.id, user.email);

        // 프로필 정보 가져오기 (sender_name 용)
        const profileResult = await getUserProfile(user.id);
        const senderName = profileResult.success && profileResult.data
            ? profileResult.data.name
            : user.email;
        debugLog('📝 [createMessage] sender_name:', senderName);

        const insertData = {
            thread_id: messageData.thread_id,
            sender_id: user.id,
            sender_type: messageData.sender_type || 'user',
            sender_name: senderName,
            content: messageData.content,
            file_url: messageData.file_url || null,
            file_name: messageData.file_name || null,
            file_type: messageData.file_type || null,
            attachments: messageData.attachments || null
        };
        debugLog('📝 [createMessage] INSERT 데이터:', insertData);

        const { data, error } = await supabaseClient
            .from('messages')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            console.error('📝 [createMessage] Supabase INSERT 오류:', error);
            throw error;
        }
        debugLog('📝 [createMessage] INSERT 성공:', data);

        // 📱 관리자가 보낸 메시지인 경우 사용자에게 SNS 알림 발송
        if (messageData.sender_type === 'admin' && typeof notifyUserOnNewMessage === 'function') {
            debugLog('📱 [createMessage] 관리자 메시지 - SNS 알림 발송');
            notifyUserOnNewMessage(messageData.thread_id, messageData.content)
                .then(result => {
                    if (result.success) {
                        debugLog('📱 [createMessage] SNS 알림 발송 성공');
                    } else {
                        debugLog('📱 [createMessage] SNS 알림 발송 실패 (무시):', result.error);
                    }
                })
                .catch(err => debugLog('SNS notification error (ignored):', err));
        }

        return { success: true, data };
    } catch (error) {
        console.error('메시지 생성 오류:', error);
        return { success: false, error: error.message };
    }
}

// 메시지 목록 조회
async function getMessages(threadId) {
    try {
        debugLog('📨 [getMessages] 메시지 조회 시작, threadId:', threadId);

        const { data, error } = await supabaseClient
            .from('messages')
            .select('*, profiles:sender_id(name, email)')
            .eq('thread_id', threadId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('📨 [getMessages] 조회 오류:', error);
            throw error;
        }

        debugLog('📨 [getMessages] 조회 성공:', data?.length || 0, '건');
        return { success: true, data };
    } catch (error) {
        console.error('메시지 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 환영 메시지 템플릿 함수
// ============================================

// 상담 쓰레드 환영 메시지 생성
async function createWelcomeMessage(threadId, serviceName) {
    try {
        const formUrl = `${window.location.origin}/profile-submit.html?thread=${threadId}`;
        const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('i18n_language')) || 'en';

        const welcomeTexts = {
            ko: {
                title: '상담 요청 확인',
                greeting: `안녕하세요! <strong>${serviceName}</strong> 상담 요청이 접수되었습니다.`,
                procedureTitle: '진행 절차 안내',
                procedureDesc: '원활한 상담 진행을 위해 아래 순서대로 진행해 주세요.',
                step1Title: '1. 기본 정보 입력',
                step1Desc: '상담에 필요한 기본 정보를 입력해 주세요.',
                step1Link: '기본사항 입력하기',
                step2Title: '2. 담당자 배정',
                step2Desc: '기본 정보 확인 후, 담당자가',
                step2Time: '30분 내',
                step2Suffix: '연락드립니다.',
                step3Title: '3. 상담 진행',
                step3Desc: '케이스 검토 후 정확한 비용과 필요 서류를 안내드립니다.',
                footer: '추가 문의사항은 이 쓰레드에 답글로 남겨주세요.',
                senderName: '법무법인 로연'
            },
            en: {
                title: 'Consultation Request Confirmed',
                greeting: `Hello! Your consultation request for <strong>${serviceName}</strong> has been received.`,
                procedureTitle: 'How It Works',
                procedureDesc: 'Please follow the steps below for a smooth consultation process.',
                step1Title: '1. Enter Basic Information',
                step1Desc: 'Please fill in the basic information needed for your consultation.',
                step1Link: 'Enter Basic Info',
                step2Title: '2. Staff Assignment',
                step2Desc: 'After reviewing your information, a staff member will contact you',
                step2Time: 'within 30 minutes',
                step2Suffix: '.',
                step3Title: '3. Consultation',
                step3Desc: 'After case review, we will provide exact costs and required documents.',
                footer: 'For additional questions, please leave a reply in this thread.',
                senderName: 'Lawyeon Law Firm'
            },
            zh: {
                title: '咨询请求确认',
                greeting: `您好！<strong>${serviceName}</strong> 咨询请求已受理。`,
                procedureTitle: '办理流程',
                procedureDesc: '为顺利进行咨询，请按以下顺序操作。',
                step1Title: '1. 填写基本信息',
                step1Desc: '请填写咨询所需的基本信息。',
                step1Link: '填写基本信息',
                step2Title: '2. 分配负责人',
                step2Desc: '确认基本信息后，负责人将在',
                step2Time: '30分钟内',
                step2Suffix: '联系您。',
                step3Title: '3. 进行咨询',
                step3Desc: '案件审核后，将为您提供准确的费用和所需文件。',
                footer: '如有其他问题，请在此会话中留言。',
                senderName: '律渊律师事务所'
            },
            vi: {
                title: 'Xac nhan yeu cau tu van',
                greeting: `Xin chao! Yeu cau tu van <strong>${serviceName}</strong> da duoc tiep nhan.`,
                procedureTitle: 'Quy trinh thuc hien',
                procedureDesc: 'Vui long thuc hien theo cac buoc sau de qua trinh tu van dien ra suon se.',
                step1Title: '1. Nhap thong tin co ban',
                step1Desc: 'Vui long nhap thong tin co ban can thiet cho tu van.',
                step1Link: 'Nhap thong tin co ban',
                step2Title: '2. Phan cong nhan vien',
                step2Desc: 'Sau khi xac nhan thong tin, nhan vien se lien he voi ban',
                step2Time: 'trong 30 phut',
                step2Suffix: '.',
                step3Title: '3. Tien hanh tu van',
                step3Desc: 'Sau khi xem xet, chung toi se cung cap chi phi chinh xac va tai lieu can thiet.',
                footer: 'Neu co cau hoi them, vui long de lai phan hoi trong chuoi hoi thoai nay.',
                senderName: 'Lawyeon'
            },
            ja: {
                title: '相談リクエスト確認',
                greeting: `こんにちは！<strong>${serviceName}</strong> の相談リクエストを受け付けました。`,
                procedureTitle: '手続きのご案内',
                procedureDesc: 'スムーズな相談のため、以下の手順に従ってください。',
                step1Title: '1. 基本情報の入力',
                step1Desc: '相談に必要な基本情報をご入力ください。',
                step1Link: '基本情報を入力する',
                step2Title: '2. 担当者配定',
                step2Desc: '基本情報確認後、担当者が',
                step2Time: '30分以内',
                step2Suffix: 'にご連絡いたします。',
                step3Title: '3. 相談進行',
                step3Desc: 'ケース検討後、正確な費用と必要書類をご案内いたします。',
                footer: '追加のご質問はこのスレッドに返信してください。',
                senderName: 'ロヨン法律事務所'
            },
            mn: {
                title: 'Зөвлөгөөний хүсэлт баталгаажсан',
                greeting: `Сайн байна уу! <strong>${serviceName}</strong> зөвлөгөөний хүсэлт хүлээн авлаа.`,
                procedureTitle: 'Явц',
                procedureDesc: 'Зөвлөгөөг жигд явуулахын тулд дараах алхмуудыг дагана уу.',
                step1Title: '1. Үндсэн мэдээлэл оруулах',
                step1Desc: 'Зөвлөгөөнд шаардлагатай үндсэн мэдээллийг оруулна уу.',
                step1Link: 'Мэдээлэл оруулах',
                step2Title: '2. Хариуцагч томилох',
                step2Desc: 'Мэдээлэл шалгасны дараа ажилтан танд',
                step2Time: '30 минутын дотор',
                step2Suffix: ' холбогдоно.',
                step3Title: '3. Зөвлөгөө',
                step3Desc: 'Хэрэг шалгасны дараа зардал болон шаардлагатай бичиг баримтыг мэдэгдэнэ.',
                footer: 'Нэмэлт асуулт байвал энэ хэлэлцүүлэгт хариу бичнэ үү.',
                senderName: 'Lawyeon'
            },
            th: {
                title: 'ยืนยันคำขอปรึกษา',
                greeting: `สวัสดีครับ/ค่ะ! คำขอปรึกษา <strong>${serviceName}</strong> ได้รับแล้ว`,
                procedureTitle: 'ขั้นตอนการดำเนินการ',
                procedureDesc: 'กรุณาทำตามขั้นตอนด้านล่างเพื่อการปรึกษาที่ราบรื่น',
                step1Title: '1. กรอกข้อมูลพื้นฐาน',
                step1Desc: 'กรุณากรอกข้อมูลพื้นฐานที่จำเป็นสำหรับการปรึกษา',
                step1Link: 'กรอกข้อมูลพื้นฐาน',
                step2Title: '2. มอบหมายเจ้าหน้าที่',
                step2Desc: 'หลังจากตรวจสอบข้อมูลแล้ว เจ้าหน้าที่จะติดต่อคุณ',
                step2Time: 'ภายใน 30 นาที',
                step2Suffix: '',
                step3Title: '3. ดำเนินการปรึกษา',
                step3Desc: 'หลังจากตรวจสอบเคส จะแจ้งค่าใช้จ่ายและเอกสารที่ต้องการ',
                footer: 'หากมีคำถามเพิ่มเติม กรุณาตอบกลับในกระทู้นี้',
                senderName: 'Lawyeon'
            }
        };

        const t = welcomeTexts[lang] || welcomeTexts.en;
        const boxStyle = 'background: #F3F4F6; border: 1px solid #E5E7EB; border-left: 1px solid #E5E7EB; border-radius: 12px; padding: 16px 20px; margin: 8px 0;';
        const titleStyle = 'font-weight: 700; color: #191F28; margin-bottom: 8px;';
        const descStyle = 'color: #374151; line-height: 1.6;';
        const linkStyle = 'color: #3182F6; font-weight: 600;';
        const highlightStyle = 'background: #FEF3C7; color: #191F28; padding: 2px 8px; border-radius: 4px; font-weight: 700;';

        const welcomeContent = `
            <h4>${t.title}</h4>
            <p>${t.greeting}</p>

            <h4>${t.procedureTitle}</h4>
            <p>${t.procedureDesc}</p>

            <div class="info-box" style="${boxStyle}">
                <div style="${titleStyle}">${t.step1Title}</div>
                <div style="${descStyle}">${t.step1Desc} <a href="${formUrl}" target="_blank" style="${linkStyle}">${t.step1Link}</a></div>
            </div>

            <div class="info-box" style="${boxStyle}">
                <div style="${titleStyle}">${t.step2Title}</div>
                <div style="${descStyle}">${t.step2Desc} <span class="highlight" style="${highlightStyle}">${t.step2Time}</span> ${t.step2Suffix}</div>
            </div>

            <div class="info-box" style="${boxStyle}">
                <div style="${titleStyle}">${t.step3Title}</div>
                <div style="${descStyle}">${t.step3Desc}</div>
            </div>

            <p>${t.footer}</p>
        `;

        // 시스템 메시지로 생성 (관리자 타입)
        const { data, error } = await supabaseClient
            .from('messages')
            .insert({
                thread_id: threadId,
                sender_id: null,
                sender_type: 'admin',
                sender_name: t.senderName,
                content: welcomeContent
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Welcome message creation error:', error);
            throw error;
        }

        debugLog('✅ Welcome message created:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Welcome message creation error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 인증 상태 변경 리스너
// ============================================

// 인증 상태 변경 감지
if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        debugLog('인증 상태 변경:', event, session);
        
        if (event === 'SIGNED_IN') {
            debugLog('로그인 성공:', session?.user?.email);
            // 프로필 체크는 각 페이지의 checkUserLogin()에서 처리
        } else if (event === 'SIGNED_OUT') {
            debugLog('로그아웃 완료');
        }
    });
}

// Supabase client loaded
