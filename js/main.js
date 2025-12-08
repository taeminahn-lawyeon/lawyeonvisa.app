// ================================================
// KOREALAND PARTNERS - MAIN JAVASCRIPT
// ================================================

// Current language state
let currentLang = 'ko';

// ===== Initialize on DOM Load =====
document.addEventListener('DOMContentLoaded', function() {
    initLanguageSelector();
    initMobileMenu();
    initFloatingChat();
    initAlertButton();
    initConsultationForm();
    initScrollEffects();
    
    // Check for saved language preference
    const savedLang = localStorage.getItem('language');
    if (savedLang && translations[savedLang]) {
        setLanguage(savedLang);
    }
});

// ===== Language Selector =====
function initLanguageSelector() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
            
            // Update active state
            langButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function setLanguage(lang) {
    if (!translations[lang]) {
        console.error('Language not found:', lang);
        return;
    }
    
    currentLang = lang;
    localStorage.setItem('language', lang);
    
    // Update all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });
    
    // Update placeholders
    updatePlaceholders(lang);
}

function updatePlaceholders(lang) {
    // Update input placeholders based on language
    const nameInput = document.querySelector('input[name="name"]');
    if (nameInput) {
        const placeholders = {
            ko: '홍길동',
            en: 'John Doe',
            zh: '张三',
            vi: 'Nguyễn Văn A'
        };
        nameInput.placeholder = placeholders[lang] || placeholders.ko;
    }
    
    const contactInput = document.querySelector('input[name="contact"]');
    if (contactInput) {
        contactInput.placeholder = '+82-10-1234-5678';
    }
}

// ===== Mobile Menu =====
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (mainNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.main-nav') && 
                !event.target.closest('.mobile-menu-toggle') &&
                mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                mobileMenuToggle.querySelector('i').classList.remove('fa-times');
                mobileMenuToggle.querySelector('i').classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mainNav.classList.remove('active');
                mobileMenuToggle.querySelector('i').classList.remove('fa-times');
                mobileMenuToggle.querySelector('i').classList.add('fa-bars');
            });
        });
    }
}

// ===== Floating Chat =====
function initFloatingChat() {
    const chatToggle = document.querySelector('.chat-toggle');
    const chatMenu = document.querySelector('.chat-menu');
    
    if (chatToggle && chatMenu) {
        // Handle web chat option
        const webChatOption = document.querySelector('.chat-option.webchat');
        if (webChatOption) {
            webChatOption.addEventListener('click', function(e) {
                e.preventDefault();
                openWebChat();
            });
        }
    }
}

function openWebChat() {
    // Simulate opening Channel Talk or similar chat widget
    alert(getTranslation('web-chat-message', {
        ko: '채팅 상담 서비스가 곧 연결됩니다.\n잠시만 기다려 주세요.',
        en: 'Web chat service will be connected shortly.\nPlease wait a moment.',
        zh: '网页聊天服务即将连接。\n请稍等。',
        vi: 'Dịch vụ chat web sẽ được kết nối ngay.\nVui lòng đợi.'
    }));
    
    // In production, you would initialize Channel Talk here:
    // ChannelIO('showMessenger');
}

// ===== Alert Button =====
function initAlertButton() {
    const alertBtn = document.getElementById('alertBtn');
    
    if (alertBtn) {
        alertBtn.addEventListener('click', function() {
            openAlertModal();
        });
    }
}

function openAlertModal() {
    const messages = {
        ko: '체류기간 만료 90일 전에 알림을 받으시려면\n이메일 주소와 체류기간 만료일을 입력해주세요.',
        en: 'To receive notifications 90 days before visa expiration,\nplease enter your email and visa expiry date.',
        zh: '要在签证到期前90天收到通知，\n请输入您的电子邮件和签证到期日期。',
        vi: 'Để nhận thông báo 90 ngày trước khi hết hạn visa,\nvui lòng nhập email và ngày hết hạn visa.'
    };
    
    const email = prompt(messages[currentLang]);
    
    if (email) {
        const confirmMessages = {
            ko: '알림 설정이 완료되었습니다!\n체류기간 만료 90일 전에 이메일로 알림을 보내드립니다.',
            en: 'Alert set successfully!\nWe will send you an email notification 90 days before expiration.',
            zh: '提醒设置成功！\n我们将在到期前90天通过电子邮件通知您。',
            vi: 'Đặt cảnh báo thành công!\nChúng tôi sẽ gửi thông báo email cho bạn 90 ngày trước khi hết hạn.'
        };
        
        alert(confirmMessages[currentLang]);
        
        // In production, you would send this to your backend
        console.log('Alert set for:', email);
    }
}

// ===== Consultation Form =====
function initConsultationForm() {
    const form = document.getElementById('quickConsultForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            // Validate form
            if (!validateConsultationForm(data)) {
                return;
            }
            
            // Submit form
            submitConsultation(data);
        });
    }
}

function validateConsultationForm(data) {
    if (!data.name || !data.nationality || !data.visaType || !data.contact || !data.service) {
        const messages = {
            ko: '모든 필드를 입력해주세요.',
            en: 'Please fill in all fields.',
            zh: '请填写所有字段。',
            vi: 'Vui lòng điền tất cả các trường.'
        };
        alert(messages[currentLang]);
        return false;
    }
    
    return true;
}

function submitConsultation(data) {
    // Show loading state
    const submitBtn = document.querySelector('#quickConsultForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    const loadingMessages = {
        ko: '<i class="fas fa-spinner fa-spin"></i> 전송 중...',
        en: '<i class="fas fa-spinner fa-spin"></i> Submitting...',
        zh: '<i class="fas fa-spinner fa-spin"></i> 提交中...',
        vi: '<i class="fas fa-spinner fa-spin"></i> Đang gửi...'
    };
    
    submitBtn.innerHTML = loadingMessages[currentLang];
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // In production, you would send this to your backend
        console.log('Consultation submitted:', data);
        
        // Show success message
        const successMessages = {
            ko: '상담 신청이 완료되었습니다!\n24시간 내에 연락드리겠습니다.\n\n신청하신 서비스를 진행하시려면 결제 페이지로 이동하세요.',
            en: 'Consultation request submitted!\nWe will contact you within 24 hours.\n\nTo proceed with your service, please go to the payment page.',
            zh: '咨询申请已提交！\n我们将在24小时内与您联系。\n\n要继续您的服务，请转到付款页面。',
            vi: 'Yêu cầu tư vấn đã được gửi!\nChúng tôi sẽ liên hệ với bạn trong vòng 24 giờ.\n\nĐể tiếp tục dịch vụ của bạn, vui lòng chuyển đến trang thanh toán.'
        };
        
        alert(successMessages[currentLang]);
        
        // Reset form
        document.getElementById('quickConsultForm').reset();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Optional: redirect to apply page
        // window.location.href = 'apply.html';
    }, 1500);
}

// ===== Scroll Effects =====
function initScrollEffects() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Add scroll-based animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    const animatedElements = document.querySelectorAll('.service-card, .visa-category-card, .review-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Header shadow on scroll
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 10) {
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        }
    });
}

// ===== Helper Functions =====
function getTranslation(key, translations) {
    return translations[currentLang] || translations.ko;
}

// ===== Mobile Menu Styles (Inject dynamically) =====
function injectMobileMenuStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        @media (max-width: 768px) {
            .main-nav {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background-color: white;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
            }
            
            .main-nav.active {
                max-height: 300px;
            }
            
            .main-nav ul {
                flex-direction: column;
                padding: 1rem 0;
            }
            
            .main-nav li {
                padding: 0.75rem 1.5rem;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .main-nav li:last-child {
                border-bottom: none;
            }
        }
    `;
    document.head.appendChild(style);
}

// Inject mobile menu styles
injectMobileMenuStyles();

// ===== Console Log =====
console.log('%c🇰🇷 KoreaLanding Partners', 'color: #2563eb; font-size: 20px; font-weight: bold;');
console.log('%cWelcome to KoreaLanding Partners', 'color: #4b5563; font-size: 14px;');
console.log('%c외국인 한국 정착 토탈 서비스', 'color: #6b7280; font-size: 12px;');
