// ============================================
// Supabase 클라이언트 초기화
// ============================================

// ⚠️ 중요: 아래 값들을 실제 Supabase 프로젝트 정보로 교체하세요
// Settings > API에서 확인 가능

// ⚠️ Supabase Dashboard → Settings → API에서 확인
const SUPABASE_URL = 'https://gqistzsergddnpcvuzba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaXN0enNlcmdkZG5wY3Z1emJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTEyMjEsImV4cCI6MjA4MDcyNzIyMX0.X_GgShObq9OJ6z7aEKdUCoyHYo-OJL-I5hcIDt4komg';

// 연결 테스트 (콘솔 로그)
console.log('🔍 Supabase 설정:', {
  url: SUPABASE_URL,
  keyPreview: SUPABASE_ANON_KEY.substring(0, 50) + '...'
});

// Supabase 클라이언트 초기화
let supabaseClient;

// Supabase CDN 로드 대기
if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase 클라이언트 즉시 초기화');
} else {
    console.warn('⚠️ Supabase CDN이 아직 로드되지 않음 - DOMContentLoaded 이벤트 대기');
    window.addEventListener('DOMContentLoaded', () => {
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase 클라이언트 지연 초기화');
        } else {
            console.error('❌ Supabase CDN 로드 실패');
        }
    });
}

// ============================================
// 인증 관련 함수
// ============================================

// Google 로그인
async function signInWithGoogle() {
    try {
        // 🚨 현재 페이지 URL 확인
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        console.log('🔍 현재 페이지:', currentPage);

        // 현재 페이지로 리디렉션
        let redirectUrl = window.location.href;

        // 🚨 페이지별 리디렉션 URL 및 universityCode 설정
        if (currentPage === 'login-jnu.html') {
            // 전남대 학생 로그인
            localStorage.setItem('universityCode', 'jnu');
            redirectUrl = window.location.origin + '/login-jnu.html';
            console.log('✅ 전남대 학생 로그인 - 대학 코드 설정');
        } else if (currentPage === 'login-korea.html') {
            // 한국대 학생 로그인
            localStorage.setItem('universityCode', 'korea');
            redirectUrl = window.location.origin + '/login-korea.html';
            console.log('✅ 한국대 학생 로그인 - 대학 코드 설정');
        } else if (currentPage === 'partner-login-jnu.html') {
            // 전남대 관리자 로그인 (universityCode 사용 안 함)
            localStorage.removeItem('universityCode');
            redirectUrl = window.location.origin + '/partner-login-jnu.html';
            console.log('✅ 전남대 관리자 로그인');
        } else if (currentPage === 'partner-login-korea.html') {
            // 한국대 관리자 로그인 (universityCode 사용 안 함)
            localStorage.removeItem('universityCode');
            redirectUrl = window.location.origin + '/partner-login-korea.html';
            console.log('✅ 한국대 관리자 로그인');
        } else if (currentPage === 'service-apply-general.html') {
            // 서비스 신청 페이지 - 현재 URL 유지 (쿼리 파라미터 포함)
            localStorage.removeItem('universityCode');
            redirectUrl = window.location.href; // 현재 URL 그대로 사용 (service ID 포함)
            console.log('✅ 서비스 신청 페이지 로그인 - 현재 URL 유지:', redirectUrl);
        } else if (currentPage === 'consultation-request.html') {
            // 상담 요청 페이지 - 현재 URL 유지 (service 파라미터 포함)
            localStorage.removeItem('universityCode');
            redirectUrl = window.location.href;
            console.log('✅ 상담 요청 페이지 로그인 - 현재 URL 유지:', redirectUrl);
        } else {
            // 일반 페이지 (index.html 등) - universityCode 삭제
            localStorage.removeItem('universityCode');
            redirectUrl = window.location.origin + '/index.html';
            console.log('✅ 일반 사용자 로그인 - 대학 코드 삭제');
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
        console.log('✅ 프로필 저장 성공 (upsert):', data);
        return { success: true, data };
    } catch (error) {
        console.error('프로필 생성/업데이트 오류:', error);
        return { success: false, error: error.message };
    }
}

// 프로필 조회
async function getUserProfile(userId) {
    try {
        console.log('프로필 조회 시도 - User ID:', userId);
        
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        console.log('Supabase 응답 - data:', data, 'error:', error);
        
        // PGRST116 에러는 "프로필 없음"을 의미 (정상)
        if (error && error.code === 'PGRST116') {
            console.log('프로필 없음 (PGRST116) - 정상');
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
        console.log('🔄 프로필 생성/업데이트 시도:', { userId, profileData });

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

        console.log('✅ 프로필 생성/업데이트 성공:', data);
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
            console.error('❌ 사용자 없음 - 로그인 필요');
            throw new Error('로그인이 필요합니다');
        }
        
        const threadRecord = {
            user_id: user.id,
            user_email: user.email,
            service_name: threadData.service_name,
            status: threadData.status || 'document',
            amount: threadData.amount || 0,
            government_fee: threadData.government_fee || 0,
            order_id: threadData.order_id || null,
            payment_id: threadData.payment_id || null,
            organization: threadData.organization || null,
            is_consulting: threadData.is_consulting || false,
            is_deferred_payment: threadData.is_deferred_payment || false,
            current_stage: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        console.log('🔄 쓰레드 생성 시도:', threadRecord);
        
        const { data, error } = await supabaseClient
            .from('threads')
            .insert(threadRecord)
            .select()
            .single();
        
        if (error) {
            console.error('❌ Supabase 쓰레드 생성 오류:', error);
            throw error;
        }
        
        console.log('✅ 쓰레드 생성 성공:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ 쓰레드 생성 실패:', error);
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
        console.log('📨 [getThreadMessages] 조회 시작, threadId:', threadId);
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('thread_id', threadId)
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error('📨 [getThreadMessages] Supabase 오류:', error);
            throw error;
        }
        console.log('📨 [getThreadMessages] 조회 성공, 개수:', data?.length || 0, '데이터:', data);
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
        
        console.log('✅ 프로필 문서 업로드 성공:', data);
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
        
        console.log('💳 결제 정보 저장 시도:', paymentData);
        
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
        
        console.log('📝 저장할 데이터:', paymentRecord);
        
        const { data, error } = await supabaseClient
            .from('payments')
            .insert(paymentRecord);
        
        if (error) {
            console.error('❌ Supabase 오류:', error);
            throw error;
        }
        
        console.log('✅ 결제 정보 저장 성공');
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
        
        console.log('📤 파일 업로드 시작:', filePath);
        
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
        
        console.log('✅ 파일 업로드 성공:', uploadData);
        
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
        console.log('📝 [createMessage] 메시지 생성 시작:', messageData);

        const user = await getCurrentUser();
        if (!user) throw new Error('로그인이 필요합니다');
        console.log('📝 [createMessage] 현재 사용자:', user.id, user.email);

        // 프로필 정보 가져오기 (sender_name 용)
        const profileResult = await getUserProfile(user.id);
        const senderName = profileResult.success && profileResult.data
            ? profileResult.data.name
            : user.email;
        console.log('📝 [createMessage] sender_name:', senderName);

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
        console.log('📝 [createMessage] INSERT 데이터:', insertData);

        const { data, error } = await supabaseClient
            .from('messages')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            console.error('📝 [createMessage] Supabase INSERT 오류:', error);
            throw error;
        }
        console.log('📝 [createMessage] INSERT 성공:', data);

        // 📱 관리자가 보낸 메시지인 경우 사용자에게 SNS 알림 발송
        if (messageData.sender_type === 'admin' && typeof notifyUserOnNewMessage === 'function') {
            console.log('📱 [createMessage] 관리자 메시지 - SNS 알림 발송');
            notifyUserOnNewMessage(messageData.thread_id, messageData.content)
                .then(result => {
                    if (result.success) {
                        console.log('📱 [createMessage] SNS 알림 발송 성공');
                    } else {
                        console.log('📱 [createMessage] SNS 알림 발송 실패 (무시):', result.error);
                    }
                })
                .catch(err => console.log('📱 [createMessage] SNS 알림 오류 (무시):', err));
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
        console.log('📨 [getMessages] 메시지 조회 시작, threadId:', threadId);

        const { data, error } = await supabaseClient
            .from('messages')
            .select('*, profiles:sender_id(name, email)')
            .eq('thread_id', threadId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('📨 [getMessages] 조회 오류:', error);
            throw error;
        }

        console.log('📨 [getMessages] 조회 성공:', data?.length || 0, '건');
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

        const welcomeContent = `
            <h4>상담 요청 확인</h4>
            <p>안녕하세요! <strong>${serviceName}</strong> 상담 요청이 접수되었습니다.</p>

            <h4>진행 절차 안내</h4>
            <p>원활한 상담 진행을 위해 아래 순서대로 진행해 주세요.</p>

            <div class="info-box">
                <div class="info-box-title">1. 기본 정보 입력</div>
                <p>상담에 필요한 기본 정보를 입력해 주세요. <a href="${formUrl}" target="_blank">기본사항 입력하기</a></p>
            </div>

            <div class="info-box">
                <div class="info-box-title">2. 담당자 배정</div>
                <p>기본 정보 확인 후, 담당자가 <span class="highlight">30분 내</span> 연락드립니다.</p>
            </div>

            <div class="info-box">
                <div class="info-box-title">3. 상담 진행</div>
                <p>케이스 검토 후 정확한 비용과 필요 서류를 안내드립니다.</p>
            </div>

            <p>추가 문의사항은 이 쓰레드에 답글로 남겨주세요.</p>
        `;

        // 시스템 메시지로 생성 (관리자 타입)
        const { data, error } = await supabaseClient
            .from('messages')
            .insert({
                thread_id: threadId,
                sender_id: null, // 시스템 메시지는 sender_id가 없음
                sender_type: 'admin',
                sender_name: '법무법인 로연',
                content: welcomeContent
            })
            .select()
            .single();

        if (error) {
            console.error('❌ 환영 메시지 생성 오류:', error);
            throw error;
        }

        console.log('✅ 환영 메시지 생성 성공:', data);
        return { success: true, data };
    } catch (error) {
        console.error('환영 메시지 생성 오류:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 인증 상태 변경 리스너
// ============================================

// 인증 상태 변경 감지
if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('인증 상태 변경:', event, session);
        
        if (event === 'SIGNED_IN') {
            console.log('로그인 성공:', session?.user?.email);
            // 프로필 체크는 각 페이지의 checkUserLogin()에서 처리
        } else if (event === 'SIGNED_OUT') {
            console.log('로그아웃 완료');
        }
    });
}

console.log('✅ Supabase 클라이언트 스크립트 로드 완료');
