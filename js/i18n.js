/**
 * 다국어 지원 시스템 (i18n) v3.0 FINAL - Internationalization System
 * 법무법인 로연 출입국이민지원센터
 * 
 * 지원 언어 (7개): 
 * - 한국어(ko) ✅ 100% 완전 번역
 * - 영어(en) ✅ 100% 완전 번역
 * - 중국어 간체(zh) ✅ 100% 완전 번역
 * - 베트남어(vi) ✅ 100% 완전 번역
 * - 일본어(ja) ✅ 100% 완전 번역
 * - 몽골어(mn) ✅ 100% 완전 번역
 * - 태국어(th) ✅ 100% 완전 번역
 * 
 * 제거된 언어: 러시아어(ru), 인도네시아어(id), 미얀마어(my)
 * 
 * 사용법:
 * 1. HTML 요소에 data-i18n="key" 추가
 * 2. i18n.translate(key) 호출하여 번역된 텍스트 가져오기
 * 3. i18n.changeLanguage('en') 호출하여 언어 변경
 */

const i18n = {
    // 현재 언어 (localStorage에서 읽거나 기본값: 영어)
    currentLanguage: (function() {
        try {
            const saved = localStorage.getItem('i18n_language');
            const supported = ['en', 'ko', 'zh', 'vi', 'ja', 'mn', 'th'];
            return (saved && supported.includes(saved)) ? saved : 'en';
        } catch (e) {
            return 'en';
        }
    })(),

    // 지원 언어 목록 (7개 언어만 지원) - English first, Korean second
    supportedLanguages: {
        en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
        ko: { name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
        zh: { name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
        vi: { name: 'Vietnamese', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
        ja: { name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
        mn: { name: 'Mongolian', flag: '🇲🇳', nativeName: 'Монгол' },
        th: { name: 'Thai', flag: '🇹🇭', nativeName: 'ไทย' }
    },
    
    /**
     * 초기화 - 저장된 언어 설정 불러오기 및 UI 업데이트
     */
    init: function() {
        // URL ?lang=<code>이 있고 지원 언어이면 우선 적용 + 영구 저장
        // (블로그 CTA에서 `?lang=vi` 등으로 진입 시 페이지 언어가 자동으로 맞춰짐)
        let urlLang = null;
        try {
            const params = new URLSearchParams(window.location.search);
            const cand = params.get('lang');
            if (cand && this.supportedLanguages[cand]) {
                urlLang = cand;
            }
        } catch (e) {}

        if (urlLang) {
            this.currentLanguage = urlLang;
            try { localStorage.setItem('i18n_language', urlLang); } catch (e) {}
        } else {
            const savedLanguage = localStorage.getItem('i18n_language');

            if (savedLanguage && this.supportedLanguages[savedLanguage]) {
                this.currentLanguage = savedLanguage;
            } else {
                // 저장된 언어가 없으면 항상 영어로 기본 설정 (브라우저 언어 감지 안함)
                this.currentLanguage = 'en';
            }
        }

        // 번역 적용
        this.translatePage();

        // 언어 선택기 초기화
        this.initLanguageSelector();

        console.log(`[i18n] Initialized with language: ${this.currentLanguage}`);
    },
    
    /**
     * 브라우저 언어 감지 (기본값: 영어)
     */
    detectBrowserLanguage: function() {
        try {
            const browserLang = navigator.language || navigator.userLanguage;
            if (!browserLang) return 'en'; // 기본값: 영어

            const langCode = browserLang.split('-')[0].toLowerCase();

            // 지원 언어인 경우에만 해당 언어 반환, 아니면 영어
            if (this.supportedLanguages[langCode]) {
                return langCode;
            }

            // 지원되지 않는 언어는 영어로 기본 설정
            return 'en';
        } catch (e) {
            console.warn('[i18n] Browser language detection failed, defaulting to English');
            return 'en';
        }
    },
    
    /**
     * 번역 키를 번역된 텍스트로 변환
     * @param {string} key - 번역 키 (예: 'hero.title')
     * @param {object} params - 동적 파라미터 (선택사항)
     * @returns {string} 번역된 텍스트
     */
    translate: function(key, params = {}) {
        // translations 객체가 로드되어 있는지 확인
        if (typeof translations === 'undefined') {
            console.error('[i18n] translations.js가 로드되지 않았습니다');
            return key;
        }
        
        // 현재 언어의 번역 데이터
        const langData = translations[this.currentLanguage];
        if (!langData) {
            console.warn(`[i18n] Language data not found: ${this.currentLanguage}`);
            return key;
        }
        
        // 번역 텍스트 찾기
        let text = langData[key];
        if (!text) {
            // 한국어로 폴백 시도
            text = translations.ko[key];
            if (!text) {
                console.warn(`[i18n] Translation not found: ${key}`);
                return key;
            }
        }
        
        // 파라미터 치환 (예: "Hello {name}" -> "Hello John")
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });
        
        return text;
    },
    
    /**
     * 언어 변경
     * @param {string} langCode - 언어 코드 (예: 'en', 'ko')
     */
    changeLanguage: function(langCode) {
        if (!this.supportedLanguages[langCode]) {
            console.error(`[i18n] Unsupported language: ${langCode}`);
            return;
        }
        
        this.currentLanguage = langCode;
        localStorage.setItem('i18n_language', langCode);
        
        // 페이지 번역 업데이트
        this.translatePage();
        
        // 언어 선택기 UI 업데이트
        this.updateLanguageSelector();
        
        // 이벤트 발생 (다른 스크립트가 언어 변경을 감지할 수 있도록)
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: langCode } }));
        
        console.log(`[i18n] Language changed to: ${langCode}`);
    },
    
    /**
     * 페이지의 모든 번역 가능한 요소 번역
     */
    translatePage: function() {
        console.log(`[i18n] translatePage() 호출 - 현재 언어: ${this.currentLanguage}`);
        
        // data-i18n 속성을 가진 모든 요소 찾기
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.translate(key);
            
            // data-i18n-attr 속성이 있으면 해당 속성에 적용
            const attr = element.getAttribute('data-i18n-attr');
            if (attr) {
                element.setAttribute(attr, text);
            } else {
                // 기본: textContent에 적용
                element.textContent = text;
            }
        });
        
        // placeholder 번역 (data-i18n-placeholder)
        const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        placeholders.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const text = this.translate(key);
            element.placeholder = text;
        });
        
        // title 번역 (data-i18n-title)
        const titles = document.querySelectorAll('[data-i18n-title]');
        titles.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const text = this.translate(key);
            element.title = text;
        });
        
        // HTML 언어 속성 업데이트
        document.documentElement.lang = this.currentLanguage;
        
        console.log(`[i18n] translatePage() 완료 - ${elements.length}개 요소 번역`);
    },
    
    /**
     * 언어 선택기 초기화
     */
    initLanguageSelector: function() {
        // 이미 초기화되었는지 확인
        if (this._languageSelectorInitialized) {
            console.log('[i18n] Language selector already initialized - skipping');
            return;
        }
        
        // 언어 선택 버튼 찾기
        const languageBtn = document.getElementById('language-selector-btn');
        const languageDropdown = document.getElementById('language-dropdown');
        
        console.log('[i18n] Initializing language selector...', {
            languageBtn: !!languageBtn,
            languageDropdown: !!languageDropdown
        });
        
        if (!languageBtn || !languageDropdown) {
            console.log('[i18n] Language selector not found - skipping initialization');
            return;
        }
        
        // 드롭다운 생성
        this.renderLanguageDropdown(languageDropdown);
        console.log('[i18n] Language dropdown rendered');
        
        // 버튼 클릭 이벤트
        languageBtn.addEventListener('click', (e) => {
            console.log('[i18n] Language button clicked');
            e.preventDefault();
            e.stopPropagation();
            languageDropdown.classList.toggle('hidden');
        });
        
        // 문서 클릭 시 드롭다운 닫기
        document.addEventListener('click', () => {
            languageDropdown.classList.add('hidden');
        });
        
        // 현재 언어 표시 업데이트
        this.updateLanguageSelector();
        
        // 초기화 완료 플래그 설정
        this._languageSelectorInitialized = true;
        console.log('[i18n] Language selector initialized successfully');
    },
    
    /**
     * 언어 드롭다운 렌더링
     */
    renderLanguageDropdown: function(container) {
        container.innerHTML = '';
        
        Object.keys(this.supportedLanguages).forEach(langCode => {
            const lang = this.supportedLanguages[langCode];
            
            const button = document.createElement('button');
            button.className = 'language-option';
            button.innerHTML = `
                <span class="language-name">${lang.nativeName}</span>
                ${langCode === this.currentLanguage ? '<span class="checkmark">✓</span>' : ''}
            `;
            button.setAttribute('data-lang', langCode);
            
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.changeLanguage(langCode);
                container.classList.add('hidden');
            });
            
            container.appendChild(button);
        });
    },
    
    /**
     * 언어 선택기 UI 업데이트
     */
    updateLanguageSelector: function() {
        const languageBtn = document.getElementById('language-selector-btn');
        if (!languageBtn) return;
        
        const currentLang = this.supportedLanguages[this.currentLanguage];
        const btnContent = languageBtn.querySelector('.language-btn-content');
        
        if (btnContent) {
            btnContent.innerHTML = `
                <span class="language-name">${currentLang.nativeName}</span>
            `;
        }
        
        // 드롭다운도 다시 렌더링
        const languageDropdown = document.getElementById('language-dropdown');
        if (languageDropdown) {
            this.renderLanguageDropdown(languageDropdown);
        }
    },
    
    /**
     * 금액을 현재 언어에 맞게 포맷 (항상 KRW 기준)
     * @param {number} amount - 금액
     * @returns {string} 포맷된 금액 문자열
     */
    formatPrice: function(amount) {
        const formatted = new Intl.NumberFormat(this.currentLanguage === 'ko' ? 'ko-KR' : 'en-US').format(amount);
        
        switch(this.currentLanguage) {
            case 'ko':
                return `${formatted}원`;
            case 'en':
                return `${formatted} KRW`;
            case 'zh':
                return `${formatted}韩元`;
            case 'vi':
                return `${formatted} KRW`;
            case 'ja':
                return `${formatted}ウォン`;
            case 'mn':
                return `${formatted} ₩`;
            case 'th':
                return `${formatted} วอน`;
            case 'ru':
                return `${formatted} вон`;
            case 'id':
                return `${formatted} KRW`;
            case 'my':
                return `${formatted} KRW`;
            default:
                return `${formatted} KRW`;
        }
    },
    
    /**
     * 날짜를 현재 언어에 맞게 포맷
     * @param {Date|string} date - 날짜 객체 또는 문자열
     * @returns {string} 포맷된 날짜 문자열
     */
    formatDate: function(date) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const localeMap = {
            'ko': 'ko-KR',
            'en': 'en-US',
            'zh': 'zh-CN',
            'vi': 'vi-VN',
            'ja': 'ja-JP',
            'mn': 'mn-MN',
            'th': 'th-TH',
            'ru': 'ru-RU',
            'id': 'id-ID',
            'my': 'my-MM'
        };
        
        const locale = localeMap[this.currentLanguage] || 'en-US';
        return dateObj.toLocaleDateString(locale, options);
    },
    
    /**
     * 현재 언어 가져오기
     * @returns {string} 현재 언어 코드
     */
    getCurrentLanguage: function() {
        return this.currentLanguage;
    },
    
    /**
     * 지원 언어 목록 가져오기
     * @returns {object} 지원 언어 객체
     */
    getSupportedLanguages: function() {
        return this.supportedLanguages;
    }
};

// DOM이 로드되면 i18n 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // translations.js가 로드된 후 초기화
        if (typeof translations !== 'undefined') {
            i18n.init();
        } else {
            console.error('[i18n] translations.js must be loaded before i18n.js');
        }
    });
} else {
    // 이미 DOM이 로드된 경우
    if (typeof translations !== 'undefined') {
        i18n.init();
    }
}

// 전역 스코프에 노출
window.i18n = i18n;
