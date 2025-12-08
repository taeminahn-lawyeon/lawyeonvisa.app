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
        if (!user) throw new Error('로그인이 필요합니다');
        
        const { data, error } = await supabase
            .from('threads')
            .insert([{
                user_id: user.id,
                ...threadData,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('쓰레드 생성 오류:', error);
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

// 메시지 전송
async function sendMessage(threadId, content, attachments = []) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('로그인이 필요합니다');
        
        const profile = await getUserProfile(user.id);
        
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                thread_id: threadId,
                sender_type: 'user',
                sender_id: user.id,
                sender_name: profile.data?.name || user.email,
                content,
                attachments,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('메시지 전송 오류:', error);
        return { success: false, error: error.message };
    }
}

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
        
        const { data, error } = await supabase
            .from('payments')
            .insert([{
                user_id: user.id,
                ...paymentData,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('결제 기록 저장 오류:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 진단 관련 함수
// ============================================

// 진단 기록 저장
async function createDiagnosisRecord(diagnosisData) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('로그인이 필요합니다');
        
        const { data, error } = await supabase
            .from('diagnosis_records')
            .insert([{
                user_id: user.id,
                ...diagnosisData,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('진단 기록 저장 오류:', error);
        return { success: false, error: error.message };
    }
}

// 사용자 진단 기록 조회
async function getUserDiagnosisRecords(userId) {
    try {
        const { data, error } = await supabase
            .from('diagnosis_records')
            .select('*')
            .eq('user_id', userId)
            .order('diagnosis_date', { ascending: false });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('진단 기록 조회 오류:', error);
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
