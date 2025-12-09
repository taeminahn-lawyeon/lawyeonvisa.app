// ============================================
// Supabase 클라이언트 초기화
// ============================================

// ⚠️ 중요: 아래 값들을 실제 Supabase 프로젝트 정보로 교체하세요
// Settings > API에서 확인 가능

const SUPABASE_URL = 'https://gqistzsergddnpcvuzba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaXN0enNlcmdkZG5wY3Z1emJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTEyMjEsImV4cCI6MjA4MDcyNzIyMX0.X_GgShObq9OJ6z7aEKdUCoyHYo-OJL-I5hcIDt4komg';

// Supabase 클라이언트 초기화
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// 인증 관련 함수
// ============================================

// Google 로그인
async function signInWithGoogle() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/index.html'
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
        const { data, error } = await supabase.auth.signInWithPassword({
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
        const { data, error } = await supabase.auth.signUp({
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
        const { error } = await supabase.auth.signOut();
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
        const { data: { user }, error } = await supabase.auth.getUser();
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
        const { data: { session }, error } = await supabase.auth.getSession();
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

// 프로필 생성
async function createUserProfile(userId, profileData) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .insert([{
                id: userId,
                ...profileData,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('프로필 생성 오류:', error);
        return { success: false, error: error.message };
    }
}

// 프로필 조회
async function getUserProfile(userId) {
    try {
        console.log('프로필 조회 시도 - User ID:', userId);
        
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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
            service_name: threadData.service_name,
            status: threadData.status || 'document',
            amount: threadData.amount || 0,
            government_fee: threadData.government_fee || 0,
            order_id: threadData.order_id || null,
            payment_id: threadData.payment_id || null,
            organization: threadData.organization || null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        console.log('🔄 쓰레드 생성 시도:', threadRecord);
        
        const { data, error } = await supabase
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
        const { data, error } = await supabase
            .from('threads')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
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
        const { data, error } = await supabase
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
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('thread_id', threadId)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
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
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) throw error;
        
        // 공개 URL 가져오기 (avatars만 공개)
        const { data: urlData } = supabase.storage
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
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(filePath, expiresIn);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('서명된 URL 생성 오류:', error);
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
        
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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
        
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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
        const { data, error } = await supabase
            .from('threads')
            .select(`
                *,
                profiles:user_id (
                    name,
                    email,
                    phone
                )
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('전체 쓰레드 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

// 쓰레드 삭제 (소프트 삭제)
async function deleteThread(threadId) {
    try {
        const { data, error } = await supabase
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
        
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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
        const { data: uploadData, error: uploadError } = await supabase.storage
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
        const { data: urlData, error: urlError } = await supabase.storage
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
        const { data, error } = await supabase.storage
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
        const { data, error } = await supabase.storage
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

// 메시지 생성 (파일 첨부 지원)
async function createMessage(messageData) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('로그인이 필요합니다');
        
        // 프로필 정보 가져오기 (sender_name 용)
        const profileResult = await getUserProfile(user.id);
        const senderName = profileResult.success && profileResult.data 
            ? profileResult.data.name 
            : user.email;
        
        const { data, error } = await supabase
            .from('messages')
            .insert({
                thread_id: messageData.thread_id,
                sender_id: user.id,
                sender_type: messageData.sender_type || 'user',
                sender_name: senderName,
                content: messageData.content,
                file_url: messageData.file_url || null,
                file_name: messageData.file_name || null,
                file_type: messageData.file_type || null
            })
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('메시지 생성 오류:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 인증 상태 변경 리스너
// ============================================

// 인증 상태 변경 감지
supabase.auth.onAuthStateChange((event, session) => {
    console.log('인증 상태 변경:', event, session);
    
    if (event === 'SIGNED_IN') {
        console.log('로그인 성공:', session?.user?.email);
        // 프로필 체크는 각 페이지의 checkUserLogin()에서 처리
    } else if (event === 'SIGNED_OUT') {
        console.log('로그아웃 완료');
    }
});

console.log('✅ Supabase 클라이언트 초기화 완료');
