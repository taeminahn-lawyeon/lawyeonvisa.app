/**
 * 안전한 파일 송수신 핸들러
 * 클라이언트 측 AES-256 암호화 (E2EE)
 */

// ============================================
// 1. 암호화 키 관리
// ============================================

/**
 * 사용자별 암호화 키 생성
 * - 사용자 로그인 시 한 번만 생성
 * - IndexedDB에 안전하게 저장 (브라우저 로컬)
 */
async function generateUserEncryptionKey(userId) {
    // AES-GCM 256비트 키 생성
    const key = await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,  // extractable
        ["encrypt", "decrypt"]
    );
    
    // 키를 내보내기 가능한 형식으로 변환
    const exportedKey = await window.crypto.subtle.exportKey("jwk", key);
    
    // IndexedDB에 저장
    await saveKeyToIndexedDB(userId, exportedKey);
    
    return key;
}

/**
 * 저장된 키 불러오기
 */
async function getUserEncryptionKey(userId) {
    const exportedKey = await getKeyFromIndexedDB(userId);
    
    if (!exportedKey) {
        // 키가 없으면 새로 생성
        return await generateUserEncryptionKey(userId);
    }
    
    // JWK 형식을 CryptoKey 객체로 변환
    const key = await window.crypto.subtle.importKey(
        "jwk",
        exportedKey,
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
    
    return key;
}

// ============================================
// 2. 파일 암호화
// ============================================

/**
 * 파일 업로드 전 암호화
 */
async function encryptFile(file, userId) {
    // File encryption started
    
    // 1. 암호화 키 가져오기
    const key = await getUserEncryptionKey(userId);
    
    // 2. 파일을 ArrayBuffer로 읽기
    const fileBuffer = await file.arrayBuffer();
    
    // 3. IV (Initialization Vector) 생성 (12 bytes for GCM)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // 4. 파일 암호화
    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        fileBuffer
    );
    
    // 5. IV와 암호문을 합침 (IV는 복호화 시 필요)
    const encryptedFile = new Uint8Array(iv.length + encryptedData.byteLength);
    encryptedFile.set(iv, 0);
    encryptedFile.set(new Uint8Array(encryptedData), iv.length);
    
    // 6. 원본 파일명 암호화 (별도 IV 사용 - AES-GCM에서 동일 key+IV 재사용 금지)
    const fileNameIv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedFileName = await encryptFileName(file.name, key, fileNameIv);
    
    return {
        encryptedData: encryptedFile,
        encryptedFileName: encryptedFileName,
        fileNameIv: arrayBufferToBase64(fileNameIv.buffer),  // 파일명 복호화용 IV (파일 IV와 별도)
        originalName: file.name,  // 메타데이터용 (해시로 변환 권장)
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
    };
}

/**
 * 파일명 암호화
 */
async function encryptFileName(fileName, key, iv) {
    const encoder = new TextEncoder();
    const data = encoder.encode(fileName);
    
    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        data
    );
    
    // Base64로 인코딩 (URL 안전)
    return arrayBufferToBase64(encryptedData);
}

// ============================================
// 3. 파일 복호화
// ============================================

/**
 * 다운로드 후 파일 복호화
 */
async function decryptFile(encryptedFile, userId, metadata) {
    // File decryption started
    
    // 1. 암호화 키 가져오기
    const key = await getUserEncryptionKey(userId);
    
    // 2. ArrayBuffer로 변환
    let encryptedBuffer;
    if (encryptedFile instanceof Blob) {
        encryptedBuffer = await encryptedFile.arrayBuffer();
    } else {
        encryptedBuffer = encryptedFile;
    }
    
    const encryptedArray = new Uint8Array(encryptedBuffer);
    
    // 3. IV 추출 (첫 12 bytes)
    const iv = encryptedArray.slice(0, 12);
    const encryptedData = encryptedArray.slice(12);
    
    // 4. 복호화
    try {
        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encryptedData
        );
        
        // File decryption complete
        
        // 5. Blob으로 변환 (다운로드 가능하게)
        const blob = new Blob([decryptedData], { type: metadata.type });
        
        return {
            blob: blob,
            fileName: metadata.originalName,
            size: metadata.size,
            type: metadata.type
        };
        
    } catch (error) {
        console.error('❌ 복호화 실패:', error);
        throw new Error('파일 복호화에 실패했습니다. 암호화 키가 올바르지 않을 수 있습니다.');
    }
}

// ============================================
// 4. Supabase 연동
// ============================================

/**
 * 암호화된 파일 업로드
 */
async function uploadSecureFile(file, userId, category = 'documents') {
    try {
        // 1. 파일 암호화
        const encrypted = await encryptFile(file, userId);
        
        // 2. 안전한 파일명 생성 (UUID)
        const safeFileName = `${crypto.randomUUID()}.encrypted`;
        const filePath = `${userId}/${category}/${safeFileName}`;
        
        // 3. Supabase Storage에 업로드
        const { data, error } = await supabase.storage
            .from('documents')
            .upload(filePath, encrypted.encryptedData, {
                contentType: 'application/octet-stream',  // 암호화된 바이너리
                upsert: false
            });
        
        if (error) throw error;
        
        // 4. 메타데이터를 DB에 저장 (암호화된 파일명 포함)
        const { data: fileRecord, error: dbError } = await supabase
            .from('file_metadata')
            .insert({
                user_id: userId,
                storage_path: filePath,
                encrypted_filename: encrypted.encryptedFileName,
                original_name_hash: await hashString(file.name),  // 검색용
                file_size: encrypted.size,
                file_type: encrypted.type,
                category: category,
                uploaded_at: encrypted.uploadedAt
            })
            .select()
            .single();
        
        if (dbError) throw dbError;
        
        // Secure upload complete
        
        return {
            fileId: fileRecord.id,
            path: filePath,
            success: true
        };
        
    } catch (error) {
        console.error('❌ 업로드 실패:', error);
        throw error;
    }
}

/**
 * 암호화된 파일 다운로드 및 복호화
 */
async function downloadSecureFile(fileId, userId) {
    try {
        // 1. 메타데이터 가져오기
        const { data: metadata, error: metaError } = await supabase
            .from('file_metadata')
            .select('*')
            .eq('id', fileId)
            .single();
        
        if (metaError) throw metaError;
        
        // 2. 권한 체크
        if (metadata.user_id !== userId) {
            // 관리자 권한 체크
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();
            
            if (profile.role !== 'super_admin') {
                throw new Error('파일 접근 권한이 없습니다.');
            }
        }
        
        // 3. 암호화된 파일 다운로드
        const { data: encryptedBlob, error: downloadError } = await supabase.storage
            .from('documents')
            .download(metadata.storage_path);
        
        if (downloadError) throw downloadError;
        
        // 4. 파일 복호화
        const decrypted = await decryptFile(encryptedBlob, metadata.user_id, {
            originalName: metadata.encrypted_filename,  // 실제로는 암호화된 이름 복호화 필요
            size: metadata.file_size,
            type: metadata.file_type
        });
        
        // 5. 접근 로그 기록
        await logFileAccess(fileId, userId, 'download');
        
        // Secure download complete
        
        return decrypted;
        
    } catch (error) {
        console.error('❌ 다운로드 실패:', error);
        throw error;
    }
}

/**
 * 브라우저에서 파일 다운로드 트리거
 */
function triggerFileDownload(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================================
// 5. 보안 유틸리티 함수
// ============================================

/**
 * 문자열 해시 (SHA-256)
 */
async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * ArrayBuffer를 Base64로 변환
 */
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Base64를 ArrayBuffer로 변환
 */
function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

// ============================================
// 6. IndexedDB 키 저장 (브라우저 로컬)
// ============================================

function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('RoyeonSecureStorage', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('encryption_keys')) {
                db.createObjectStore('encryption_keys', { keyPath: 'userId' });
            }
        };
    });
}

async function saveKeyToIndexedDB(userId, key) {
    const db = await openIndexedDB();
    const transaction = db.transaction(['encryption_keys'], 'readwrite');
    const store = transaction.objectStore('encryption_keys');
    
    await store.put({ userId, key });
}

async function getKeyFromIndexedDB(userId) {
    const db = await openIndexedDB();
    const transaction = db.transaction(['encryption_keys'], 'readonly');
    const store = transaction.objectStore('encryption_keys');
    
    return new Promise((resolve, reject) => {
        const request = store.get(userId);
        request.onsuccess = () => {
            const result = request.result;
            resolve(result ? result.key : null);
        };
        request.onerror = () => reject(request.error);
    });
}

// ============================================
// 7. 접근 로그
// ============================================

async function logFileAccess(fileId, userId, action) {
    await supabase
        .from('file_access_logs')
        .insert({
            file_id: fileId,
            user_id: userId,
            action: action,  // 'upload', 'download', 'delete', 'view'
            ip_address: await getUserIP(),
            user_agent: navigator.userAgent,
            accessed_at: new Date().toISOString()
        });
}

async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch {
        return 'unknown';
    }
}

// ============================================
// 8. Export
// ============================================

export {
    uploadSecureFile,
    downloadSecureFile,
    triggerFileDownload,
    encryptFile,
    decryptFile,
    logFileAccess
};
