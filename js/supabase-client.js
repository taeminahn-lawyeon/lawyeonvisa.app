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
async function signInWithGoogle(redirectToOverride) {
    try {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        // 현재 페이지로 리디렉션
        let redirectUrl = window.location.href;

        // 명시적 목적지가 전달되면 그대로 사용(예: 마이페이지 진입 시 로그인 후 마이페이지로 직행)
        if (redirectToOverride) {
            try { redirectUrl = new URL(redirectToOverride, window.location.href).href; }
            catch (_) { redirectUrl = redirectToOverride; }
        } else
        // 페이지별 리디렉션 URL 및 universityCode 설정
        if (currentPage === 'service-apply-general.html') {
            localStorage.removeItem('universityCode');
            redirectUrl = window.location.href;
        } else if (currentPage === 'consultation-request.html') {
            localStorage.removeItem('universityCode');
            redirectUrl = window.location.href;
        } else if (currentPage.startsWith('login-')) {
            // 대학교 전용 로그인 페이지는 자기 자신으로 복귀
            redirectUrl = window.location.href;
        } else if (currentPage === 'thread-general-v2.html') {
            // 쓰레드 페이지: 이메일 링크 자동 로그인 흐름을 위해 현재 URL(?id= 포함) 보존
            redirectUrl = window.location.href;
        } else if (currentPage === 'business-immigration-request.html') {
            // 사업이민 신청 페이지: 로그인 후 같은 페이지로 돌아와 제출 이어가기
            localStorage.removeItem('universityCode');
            redirectUrl = window.location.href;
        } else if (currentPage.indexOf('.') === -1) {
            // Renewal build pages use clean (extensionless) URLs — return to the current page
            localStorage.removeItem('universityCode');
            redirectUrl = window.location.href;
        } else {
            // 그 외 페이지: 로그인 후 index가 아니라 '현재 페이지'로 복귀시킨다
            // (예: urgent-consultation-request.html, profile-submit.html 등 — index로 튕기던 버그 수정)
            localStorage.removeItem('universityCode');
            redirectUrl = window.location.href;
        }

        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                queryParams: {
                    prompt: 'select_account'
                }
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

// 세션을 레이스(구글 OAuth 콜백 처리·세션 복원 지연) 내성 있게 확인.
// 로그인 직후 콜백 URL(#access_token)이 아직 처리되지 않아 getSession()이
// 잠깐 null을 돌려주는 사이에 index로 튕기던 문제를 방지한다.
async function getSessionWithRetry(maxRetries = 4, delayMs = 300) {
    const hasOAuthReturn = /[#&?](access_token|code)=/.test(
        (window.location.hash || '') + (window.location.search || '')
    );
    for (let i = 0; ; i++) {
        const s = await checkSession();
        if (s && s.user) return s;
        if (i >= maxRetries) return null;
        // OAuth 토큰이 URL에 있으면 Supabase가 처리할 시간을 조금 더 준다
        await new Promise(r => setTimeout(r, hasOAuthReturn ? Math.max(delayMs, 500) : delayMs));
    }
}

// 로그인 필요 시: index로 튕기지 말고 '현재 페이지로 복귀'하도록 구글 로그인을 시작한다.
// (returnUrl 미지정 시 현재 URL 보존 → 로그인 후 같은 화면으로 돌아옴)
async function requireLogin(returnUrl) {
    returnUrl = returnUrl || window.location.href;
    try { localStorage.setItem('redirectAfterLogin', returnUrl); } catch (_) {}
    try { localStorage.setItem('postLoginRedirect', returnUrl); } catch (_) {}
    if (typeof signInWithGoogle === 'function') {
        try { await signInWithGoogle(returnUrl); return true; } catch (_) {}
    }
    window.location.href = 'index.html'; // 최후 폴백
    return false;
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

        const upsertPayload = {
            id: userId,
            name: profileData.name || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        // organization 은 명시적으로 전달된 경우에만 포함 (기존 값을 null 로 덮어쓰지 않도록)
        if (profileData.organization) {
            upsertPayload.organization = profileData.organization;
        }

        const { data, error } = await supabaseClient
            .from('profiles')
            .upsert(upsertPayload, {
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
// 방문 예약 (reservations)
// ============================================

// 방문 상담 예약 생성 (로그인 불필요 — anon insert 허용)
// UUID v4 (crypto.randomUUID 우선, 미지원 환경 폴백)
function uuidv4() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (_) {}
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r;
        try { r = (window.crypto && crypto.getRandomValues) ? (crypto.getRandomValues(new Uint8Array(1))[0] & 15) : (Math.random() * 16 | 0); }
        catch (_) { r = Math.random() * 16 | 0; }
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function createReservation(reservationData) {
    try {
        if (!supabaseClient) {
            throw new Error('Supabase 클라이언트가 준비되지 않았습니다');
        }

        // 로그인한 사용자라면 user_id 를 함께 기록 (선택)
        let userId = null;
        try {
            const u = await getCurrentUser();
            if (u && u.id) userId = u.id;
        } catch (_) { /* 비로그인 방문자 — 무시 */ }

        // 행 id를 클라이언트에서 생성한다.
        // 이유: anon(비로그인) 방문자는 reservations SELECT 권한이 없어, insert 후
        // .select() 되읽기가 RLS로 막혀 '저장 실패'로 잘못 표시되던 버그가 있었다.
        // id를 미리 알면 되읽기 없이도 어드민 알림(id 기반)을 보낼 수 있다.
        const newId = uuidv4();
        const email = ((reservationData.email || '').trim()) || null;
        const visa  = ((reservationData.visa  || '').trim()) || null;
        const memoRaw = (reservationData.memo || '').trim();

        const base = {
            id: newId,
            user_id: userId,
            name: (reservationData.name || '').trim(),
            phone: (reservationData.phone || '').trim(),
            office: reservationData.office || null,
            topic: reservationData.topic || null,
            reserve_date: reservationData.reserve_date, // 'YYYY-MM-DD'
            reserve_time: reservationData.reserve_time, // 'HH:MM'
            lang: reservationData.lang || 'ko'
        };

        // 1차: email/visa 전용 컬럼에 저장 시도
        let record = Object.assign({}, base, { email: email, visa: visa, memo: memoRaw || null });
        let { error } = await supabaseClient.from('reservations').insert(record);

        // email/visa 컬럼이 아직 없는 환경이면 memo에 합쳐 재시도(데이터 유실 방지)
        if (error && /column|schema cache|does not exist|PGRST204/i.test(String(error.message || '') + String(error.code || ''))) {
            const extra = [];
            if (email) extra.push('Email: ' + email);
            if (visa)  extra.push('Visa: ' + visa);
            const mergedMemo = extra.length
                ? '[' + extra.join(' | ') + ']' + (memoRaw ? '\n' + memoRaw : '')
                : (memoRaw || null);
            record = Object.assign({}, base, { memo: mergedMemo });
            ({ error } = await supabaseClient.from('reservations').insert(record));
        }

        if (error) {
            console.error('Supabase 예약 생성 오류:', error);
            throw error;
        }

        debugLog('방문 예약 생성 성공:', newId);

        // 📧 신규 예약 시 어드민 이메일 알림 (실패는 무시 — 저장 성공이 우선)
        notifyAdminOnNewReservation(newId)
            .then(res => debugLog('📧 [createReservation] 어드민 알림 결과:', res))
            .catch(err => debugLog('Reservation notification error (ignored):', err));

        return { success: true, data: Object.assign({ id: newId }, base, { email: email, visa: visa, memo: memoRaw }) };
    } catch (error) {
        console.error('방문 예약 생성 실패:', error);
        return { success: false, error: error.message };
    }
}

// 신규 예약 어드민 이메일 알림 (send-admin-email Edge Function 호출)
// 예약은 비로그인 방문자도 가능하므로, 세션이 있으면 access_token, 없으면 anon key 로 호출.
async function notifyAdminOnNewReservation(reservationId) {
    try {
        let token = SUPABASE_ANON_KEY;
        try {
            const { data } = await supabaseClient.auth.getSession();
            if (data && data.session && data.session.access_token) {
                token = data.session.access_token;
            }
        } catch (_) { /* 비로그인 — anon key 사용 */ }

        const res = await fetch(SUPABASE_URL + '/functions/v1/send-admin-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ type: 'reservation', reservationId }),
            keepalive: true  // 접수 직후 페이지 이동에도 알림 요청이 취소되지 않도록
        });
        if (!res.ok) {
            return { success: false, error: await res.text() };
        }
        return { success: true, data: await res.json() };
    } catch (error) {
        console.error('예약 어드민 알림 실패(무시):', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 기업 자문 문의 (로그인 불필요 — anon INSERT 허용 테이블)
// ============================================
async function createCorporateInquiry(inquiryData) {
    try {
        if (!supabaseClient) {
            throw new Error('Supabase 클라이언트가 준비되지 않았습니다');
        }
        // 로그인 상태라면 user_id 기록(선택). 비로그인 문의는 NULL.
        let userId = null;
        try {
            const u = await getCurrentUser();
            if (u && u.id) userId = u.id;
        } catch (_) { /* 비로그인 방문자 — 무시 */ }

        const record = {
            user_id: userId,
            name: (inquiryData.name || '').trim(),
            company: ((inquiryData.company || '').trim()) || null,
            phone: (inquiryData.phone || '').trim(),
            email: ((inquiryData.email || '').trim()) || null,
            message: ((inquiryData.message || '').trim()) || null,
            lang: inquiryData.lang || 'ko'
        };

        const { data, error } = await supabaseClient
            .from('corporate_inquiries')
            .insert(record)
            .select()
            .single();

        if (error) {
            console.error('기업 자문 문의 생성 오류:', error);
            throw error;
        }

        debugLog('기업 자문 문의 생성 성공:', data);

        // 📧 어드민 이메일 알림 (실패는 무시 — 저장 성공이 우선)
        notifyAdminOnNewInquiry(data.id)
            .then(res => debugLog('📧 [createCorporateInquiry] 어드민 알림 결과:', res))
            .catch(err => debugLog('Inquiry notification error (ignored):', err));

        return { success: true, data };
    } catch (error) {
        console.error('기업 자문 문의 생성 실패:', error);
        return { success: false, error: error.message };
    }
}

// 신규 기업 자문 문의 어드민 이메일 알림 (send-admin-email Edge Function 호출)
async function notifyAdminOnNewInquiry(inquiryId) {
    try {
        let token = SUPABASE_ANON_KEY;
        try {
            const { data } = await supabaseClient.auth.getSession();
            if (data && data.session && data.session.access_token) {
                token = data.session.access_token;
            }
        } catch (_) { /* 비로그인 — anon key 사용 */ }

        const res = await fetch(SUPABASE_URL + '/functions/v1/send-admin-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ type: 'corporate_inquiry', inquiryId }),
            keepalive: true  // 접수 직후 페이지 이동에도 알림 요청이 취소되지 않도록
        });
        if (!res.ok) {
            return { success: false, error: await res.text() };
        }
        return { success: true, data: await res.json() };
    } catch (error) {
        console.error('기업 자문 어드민 알림 실패(무시):', error);
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
        if (threadData.is_consulting !== undefined) {
            threadRecord.is_consulting = threadData.is_consulting;
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

        // 📧 신규 쓰레드 생성 시 어드민에게 이메일 알림
        if (typeof notifyAdminOnNewThread === 'function') {
            debugLog('📧 [createThread] 어드민 알림 발송');
            notifyAdminOnNewThread(data.id)
                .then(result => debugLog('📧 [createThread] 어드민 알림 결과:', result))
                .catch(err => debugLog('Admin notification error (ignored):', err));
        }

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
            .insert(paymentRecord)
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase 오류:', error);
            throw error;
        }

        debugLog('✅ 결제 정보 저장 성공:', data);
        return { success: true, data };
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
// 견적(quote) 관련 함수
// ============================================

// 견적 생성 (관리자) — 스레드 내 결제 링크 발송용
async function createQuote(quoteData) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('로그인이 필요합니다');

        const totalAmount = Number(quoteData.total_amount) || 0;

        const insertData = {
            thread_id: quoteData.thread_id,
            created_by: user.id,
            agency_fee: 0,
            govt_fee: 0,
            total_amount: totalAmount,
            currency: quoteData.currency || 'KRW',
            payment_method: quoteData.payment_method || 'both',
            toss_order_id: 'QUO' + Date.now(),
            status: 'sent'
        };
        if (quoteData.expires_at) insertData.expires_at = quoteData.expires_at;

        const { data, error } = await supabaseClient
            .from('quotes')
            .insert(insertData)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('견적 생성 오류:', error);
        return { success: false, error: error.message };
    }
}

// 견적 단건 조회 (RLS: 본인 스레드 또는 관리자만)
async function getQuote(quoteId) {
    try {
        const { data, error } = await supabaseClient
            .from('quotes')
            .select('*')
            .eq('id', quoteId)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('견적 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

// 스레드의 모든 견적 조회 (카드 렌더용 상태 맵)
async function getThreadQuotes(threadId) {
    try {
        const { data, error } = await supabaseClient
            .from('quotes')
            .select('*')
            .eq('thread_id', threadId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('스레드 견적 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

// 견적 수동 결제 완료 처리 (관리자) — 주로 Wise 해외 송금 확인 후
async function markQuotePaid(quoteId, paidVia = 'wise') {
    try {
        const { data, error } = await supabaseClient
            .from('quotes')
            .update({
                status: 'paid',
                paid_via: paidVia,
                paid_at: new Date().toISOString()
            })
            .eq('id', quoteId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('견적 결제 완료 처리 오류:', error);
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
                profiles!left (
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

        // 📧 관리자 메시지인 경우 고객에게 이메일 알림 발송 (Resend)
        if (messageData.sender_type === 'admin' && typeof notifyUserByEmailOnNewMessage === 'function') {
            debugLog('📧 [createMessage] 관리자 메시지 - 이메일 알림 발송');
            notifyUserByEmailOnNewMessage(messageData.thread_id)
                .then(result => {
                    if (result.success) {
                        debugLog('📧 [createMessage] 이메일 알림 발송 성공');
                    } else {
                        debugLog('📧 [createMessage] 이메일 알림 발송 실패 (무시):', result.error);
                    }
                })
                .catch(err => debugLog('Email notification error (ignored):', err));
        }

        // 📧 고객(user) 메시지인 경우 어드민에게 이메일 알림 발송
        // 첫 user 메시지는 createThread의 new_thread 이벤트와 중복되므로 서버에서 dedup 처리됨
        const senderType = messageData.sender_type || 'user';
        if (senderType === 'user' && typeof notifyAdminOnNewMessage === 'function') {
            debugLog('📧 [createMessage] 고객 메시지 - 어드민 알림 발송');
            notifyAdminOnNewMessage(messageData.thread_id)
                .then(result => debugLog('📧 [createMessage] 어드민 알림 결과:', result))
                .catch(err => debugLog('Admin notification error (ignored):', err));
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

// 상담 쓰레드 환영 메시지 생성 (다국어 지원)
async function createWelcomeMessage(threadId, serviceName) {
    try {
        // 관리자 모드일 때 URL에 mode=admin 추가 (새 탭에서도 인식 가능)
        const isAdminMode = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('adminLoggedIn') === 'true';
        const formUrl = `${window.location.origin}/profile-submit.html?thread=${threadId}${isAdminMode ? '&mode=admin' : ''}`;
        const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('i18n_language'))
            || ((typeof document !== 'undefined' && (document.documentElement.getAttribute('lang') || '').toLowerCase().indexOf('ko') === 0) ? 'ko' : 'en');

        // 다국어 번역 헬퍼 - translations.js가 로드된 경우 사용, 아니면 폴백
        function tw(key, fallback) {
            if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
                return translations[lang][key];
            }
            // 영어 폴백
            if (typeof translations !== 'undefined' && translations.en && translations.en[key]) {
                return translations.en[key];
            }
            return fallback || key;
        }

        // D-10-1 서비스 여부 감지
        const isD10 = serviceName && (serviceName.toLowerCase().includes('d-10-1') || serviceName.toLowerCase().includes('d10-1'));

        let welcomeContent;

        if (isD10) {
            // ===== D-10-1 결제 완료 안내문 (3단계) =====
            welcomeContent = `
                <h4>${tw('thread.welcome.d10.title', 'D-10-1 Visa Change - Payment Completed')}</h4>
                <p>${tw('thread.welcome.d10.greeting', 'Payment for <strong>{serviceName}</strong> has been completed. Please follow the steps below.').replace('{serviceName}', serviceName)}</p>

                <h4>${tw('thread.welcome.d10.procedureTitle', 'Procedure Guide')}</h4>

                <div class="info-box" style="background: #F3F4F6; border: 1px solid #E5E7EB; border-left: 1px solid #E5E7EB; border-radius: 12px; padding: 16px 20px; margin: 8px 0;">
                    <div style="font-weight: 700; color: #191F28; margin-bottom: 8px;">1. ${tw('thread.welcome.d10.step1Title', 'Submit Basic Information')}</div>
                    <div style="color: #374151; line-height: 1.6;">${tw('thread.welcome.d10.step1Desc', 'Please enter the basic information required for visa change.')} <a href="${formUrl}" target="_blank" style="color: #3182F6; font-weight: 600;">${tw('thread.welcome.d10.step1Link', 'Enter Basic Info')}</a></div>
                </div>

                <div class="info-box" style="background: #F3F4F6; border: 1px solid #E5E7EB; border-left: 1px solid #E5E7EB; border-radius: 12px; padding: 16px 20px; margin: 8px 0;">
                    <div style="font-weight: 700; color: #191F28; margin-bottom: 8px;">2. ${tw('thread.welcome.d10.step2Title', 'Enter D-10-1 Information')}</div>
                    <div style="color: #374151; line-height: 1.6;">${tw('thread.welcome.d10.step2Desc', 'A specialist will send the D-10-1 information form in this thread. Please fill it out including your job search plan.')}</div>
                </div>

                <div class="info-box" style="background: #F3F4F6; border: 1px solid #E5E7EB; border-left: 1px solid #E5E7EB; border-radius: 12px; padding: 16px 20px; margin: 8px 0;">
                    <div style="font-weight: 700; color: #191F28; margin-bottom: 8px;">3. ${tw('thread.welcome.d10.step3Title', 'Document Review & Guidance')}</div>
                    <div style="color: #374151; line-height: 1.6;">${tw('thread.welcome.d10.step3Desc', 'After reviewing your submitted documents, a specialist will provide detailed guidance in this thread.')}</div>
                </div>

                <p>${tw('thread.welcome.d10.footer', 'If you have additional questions, please leave a reply in this thread.')}</p>
            `;
        } else {
            // ===== 일반(온라인) 상담 안내문 — 다국어 인라인 =====
            // 응대 주체(변호사/스태프/전문가)나 응답 시간은 표기하지 않고, "로연"이 답한다고만 안내.
            const isAdmin = isAdminMode;
            let hasProfile = false;
            if (!isAdmin) {
                try {
                    const session = await supabaseClient.auth.getSession();
                    if (session?.data?.session?.user?.id) {
                        const profileResult = await getUserProfile(session.data.session.user.id);
                        if (profileResult.success && profileResult.data && profileResult.data.passport_number) {
                            hasProfile = true;
                        }
                    }
                } catch (e) {
                    // 프로필 확인 실패 시 기본사항 제출 링크 포함
                }
            }

            const isKoLang = (lang === 'ko');
            const visaInfoUrl = (isKoLang ? '/ko/' : '/') + 'visa-info';
            const W = isKoLang ? {
                title: '상담 신청이 접수되었습니다',
                greeting: `안녕하세요. <strong>${serviceName}</strong> 신청이 접수되어 전용 쓰레드가 열렸습니다.`,
                lead: '상담받고 싶은 내용을 이 쓰레드에 자유롭게 남겨 주세요. 관련 서류나 사진이 있다면 함께 올려 주시면 검토에 도움이 됩니다. 남겨 주신 내용은 <strong>로연</strong>에서 확인한 뒤 이 쓰레드로 답변드립니다.',
                infoTitle: '체류·비자 정보',
                infoDesc: '체류 상태(비자·만료일 등)를 입력하거나 수정하시려면 아래에서 진행해 주세요.',
                infoLink: '정보 입력·수정',
                footer: '추가로 궁금하신 점도 이 쓰레드에 남겨 주세요.'
            } : {
                title: 'Your consultation request has been received',
                greeting: `Hello. Your request for <strong>${serviceName}</strong> has been received and a private thread has been opened.`,
                lead: 'Please share here what you would like to consult about. If you have any related documents or photos, feel free to attach them — it helps us review. <strong>Lawyeon</strong> will review what you share and reply in this thread.',
                infoTitle: 'Your residence information',
                infoDesc: 'To enter or update your residence status (visa, expiry, etc.), use the link below.',
                infoLink: 'Enter / update info',
                footer: 'For any further questions, just leave them in this thread.'
            };

            // 정보는 언제든 입력·수정할 수 있도록 항상 안내(쓰레드에서 다시 받을 수 있음).
            const infoBox = `
                <div class="info-box" style="background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px 20px; margin: 12px 0;">
                    <div style="font-weight: 700; color: #191F28; margin-bottom: 6px;">${W.infoTitle}</div>
                    <div style="color: #374151; line-height: 1.6;">${W.infoDesc} <a href="${visaInfoUrl}" target="_blank" style="color: #887668; font-weight: 600;">${W.infoLink}</a></div>
                </div>
            `;

            welcomeContent = `
                <h4>${W.title}</h4>
                <p>${W.greeting}</p>
                <p>${W.lead}</p>
                ${infoBox}
                <p>${W.footer}</p>
            `;
        }

        // 시스템 메시지로 생성 (관리자 타입)
        const { data, error } = await supabaseClient
            .from('messages')
            .insert({
                thread_id: threadId,
                sender_id: null, // 시스템 메시지는 sender_id가 없음
                sender_type: 'admin',
                sender_name: (lang === 'ko' ? '법무법인 로연' : 'Law Firm Lawyeon'),
                content: welcomeContent
            })
            .select()
            .single();

        if (error) {
            console.error('❌ 환영 메시지 생성 오류:', error);
            throw error;
        }

        debugLog('✅ 환영 메시지 생성 성공:', data);
        return { success: true, data };
    } catch (error) {
        console.error('환영 메시지 생성 오류:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 사업이민 (Business Immigration) 전용 함수
// 참조: BUSINESS_IMMIGRATION_SPEC.md 섹션 14
// ============================================

// 시스템 에러 로그 INSERT (섹션 14-8-4)
// 쓰레드 생성 실패, RPC 실패 등 모든 오류 이벤트 수집용.
// INSERT 자체가 실패해도 무음 처리(이중 실패 방지).
async function logSystemError(payload) {
    if (!supabaseClient) return;
    try {
        const session = await supabaseClient.auth.getSession();
        const userId = session?.data?.session?.user?.id || null;
        await supabaseClient.from('system_errors').insert({
            user_id: userId,
            error_type: payload.error_type,
            error_code: payload.error_code || null,
            request_id: payload.request_id || null,
            context: payload.context || null
        });
    } catch (_) {
        // 의도적 무음
    }
}

// 사업이민 문서 업로드 (섹션 14-3-4)
// 경로: {user_id}/{document_type}/{timestamp}_{sanitizedFileName}
// document_type: passport | criminal_record | education | family | funding | contracts
async function uploadBusinessImmigrationDocument(documentType, file) {
    try {
        const session = await supabaseClient.auth.getSession();
        if (!session?.data?.session) {
            throw new Error('Not authenticated');
        }
        const userId = session.data.session.user.id;

        const allowedTypes = ['passport','criminal_record','education','family','funding','contracts'];
        if (!allowedTypes.includes(documentType)) {
            throw new Error('Invalid document_type: ' + documentType);
        }

        const timestamp = Date.now();
        const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${userId}/${documentType}/${timestamp}_${sanitized}`;

        const { data, error } = await supabaseClient.storage
            .from('business-immigration-documents')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (error) throw error;
        debugLog('✅ 사업이민 문서 업로드 성공:', filePath);
        return { success: true, data, path: filePath };
    } catch (error) {
        console.error('사업이민 문서 업로드 오류:', error);
        return { success: false, error: error.message };
    }
}

// 프로필 완성도 판정 (섹션 14-6-3)
// request_type 분기:
//   - 'business_immigration': business_immigration_profiles.profile_completed 조회
//   - 'general' (또는 그 외): 기존 profiles.passport_number NULL 여부 판정
async function isProfileCompleteForRequest(userId, requestType) {
    if (!userId) return false;

    if (requestType === 'business_immigration') {
        try {
            const { data, error } = await supabaseClient
                .from('business_immigration_profiles')
                .select('profile_completed')
                .eq('user_id', userId)
                .maybeSingle();
            if (error || !data) return false;
            return data.profile_completed === true;
        } catch (e) {
            console.error('사업이민 프로필 완성도 조회 오류:', e);
            return false;
        }
    }

    // 기존 일반 경로 — passport_number 단일 필드 기준 유지
    try {
        const { data } = await supabaseClient
            .from('profiles')
            .select('passport_number')
            .eq('id', userId)
            .maybeSingle();
        return !!(data && data.passport_number);
    } catch (_) {
        return false;
    }
}

// 사업이민 상담 신청 RPC 호출 (섹션 14-8-4)
// consultation_requests + threads + 연결을 단일 트랜잭션으로 처리.
// 실패 시 전체 롤백, 재시도 시 중복 없음.
async function createBusinessImmigrationRequest(formData) {
    try {
        const { data, error } = await supabaseClient.rpc(
            'create_business_immigration_request',
            {
                p_nationality:        formData.nationality,
                p_residence_country:  formData.residence_country,
                p_visa_type_interest: formData.visa_type_interest,
                p_family_composition: formData.family_composition ?? null,
                p_children_count:     formData.children_count ?? null,
                p_timeline:           formData.timeline ?? null,
                p_message:            formData.message ?? null,
                p_contact_method:     formData.contact_method,
                p_email:              formData.email
            }
        );
        if (error) throw error;
        debugLog('✅ 사업이민 상담 RPC 성공:', data);
        return { success: true, data };
    } catch (error) {
        console.error('사업이민 상담 RPC 오류:', error);
        return { success: false, error: error.message, code: error.code };
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
