/**
 * UI Components Library
 * 재사용 가능한 UI 컴포넌트 및 유틸리티 함수
 */

// ========================================
// 1. 토스트 알림 시스템
// ========================================

class ToastNotification {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="closeToast(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.container.appendChild(toast);
        
        // 애니메이션 시작
        setTimeout(() => toast.classList.add('show'), 10);
        
        // 자동 제거
        if (duration > 0) {
            setTimeout(() => {
                this.hide(toast);
            }, duration);
        }
        
        return toast;
    }

    hide(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }
}

// 전역 인스턴스
const toast = new ToastNotification();

// 편의 함수
function showToast(message, type = 'info', duration = 4000) {
    return toast.show(message, type, duration);
}

function closeToast(button) {
    const toastElement = button.closest('.toast');
    toast.hide(toastElement);
}

// ========================================
// 2. 폼 검증 시스템
// ========================================

class FormValidator {
    constructor() {
        this.rules = {
            required: (value) => value.trim() !== '',
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            phone: (value) => /^010-\d{4}-\d{4}$/.test(value),
            phoneRaw: (value) => /^010\d{8}$/.test(value.replace(/\D/g, '')),
            minLength: (value, min) => value.length >= min,
            maxLength: (value, max) => value.length <= max,
            number: (value) => !isNaN(value) && value !== '',
            min: (value, min) => parseFloat(value) >= min,
            max: (value, max) => parseFloat(value) <= max
        };

        this.messages = {
            required: '필수 입력 항목입니다',
            email: '올바른 이메일 형식이 아닙니다',
            phone: '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)',
            phoneRaw: '올바른 전화번호 형식이 아닙니다',
            minLength: (min) => `최소 ${min}자 이상 입력해주세요`,
            maxLength: (max) => `최대 ${max}자까지 입력 가능합니다`,
            number: '숫자만 입력 가능합니다',
            min: (min) => `${min} 이상의 값을 입력해주세요`,
            max: (max) => `${max} 이하의 값을 입력해주세요`
        };
    }

    validate(input, rules) {
        const value = input.value;
        
        for (let rule of rules) {
            let ruleName, ruleParam;
            
            if (typeof rule === 'string') {
                ruleName = rule;
            } else {
                ruleName = rule.name;
                ruleParam = rule.param;
            }
            
            const validator = this.rules[ruleName];
            if (!validator) continue;
            
            const isValid = ruleParam !== undefined 
                ? validator(value, ruleParam)
                : validator(value);
            
            if (!isValid) {
                const message = typeof this.messages[ruleName] === 'function'
                    ? this.messages[ruleName](ruleParam)
                    : this.messages[ruleName];
                
                this.showError(input, message);
                return false;
            }
        }
        
        this.showSuccess(input);
        return true;
    }

    showError(input, message) {
        input.classList.remove('success');
        input.classList.add('error');
        
        let errorDiv = input.parentElement.querySelector('.field-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            input.parentElement.appendChild(errorDiv);
        }
        
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorDiv.style.display = 'flex';
    }

    showSuccess(input) {
        input.classList.remove('error');
        input.classList.add('success');
        
        const errorDiv = input.parentElement.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    clearValidation(input) {
        input.classList.remove('error', 'success');
        const errorDiv = input.parentElement.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }
}

const formValidator = new FormValidator();

// ========================================
// 3. 전화번호 자동 포맷팅
// ========================================

function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 3) {
        input.value = value;
    } else if (value.length <= 7) {
        input.value = value.slice(0, 3) + '-' + value.slice(3);
    } else {
        input.value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
}

function setupPhoneInput(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    input.addEventListener('input', function() {
        formatPhoneNumber(this);
    });
    
    input.addEventListener('blur', function() {
        formValidator.validate(this, ['phone']);
    });
}

// ========================================
// 4. 로딩 버튼 상태 관리
// ========================================

class LoadingButton {
    constructor(button) {
        this.button = button;
        this.originalHTML = button.innerHTML;
        this.originalDisabled = button.disabled;
    }

    setLoading(message = '처리 중...') {
        this.button.disabled = true;
        this.button.classList.add('loading');
        this.button.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>${message}</span>
        `;
    }

    setSuccess(message = '완료!', duration = 1000) {
        this.button.classList.remove('loading');
        this.button.classList.add('success');
        this.button.innerHTML = `
            <i class="fas fa-check"></i>
            <span>${message}</span>
        `;
        
        if (duration > 0) {
            setTimeout(() => this.reset(), duration);
        }
    }

    setError(message = '오류 발생', duration = 2000) {
        this.button.classList.remove('loading');
        this.button.classList.add('error');
        this.button.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        if (duration > 0) {
            setTimeout(() => this.reset(), duration);
        }
    }

    reset() {
        this.button.disabled = this.originalDisabled;
        this.button.classList.remove('loading', 'success', 'error');
        this.button.innerHTML = this.originalHTML;
    }
}

// ========================================
// 5. 모달/다이얼로그 시스템
// ========================================

class Modal {
    constructor() {
        this.modal = null;
    }

    show(content, options = {}) {
        const {
            title = '',
            confirmText = '확인',
            cancelText = '취소',
            onConfirm = null,
            onCancel = null,
            showCancel = true
        } = options;

        // 모달 HTML 생성
        this.modal = document.createElement('div');
        this.modal.className = 'modal-overlay';
        this.modal.innerHTML = `
            <div class="modal-container">
                ${title ? `<div class="modal-header"><h3>${title}</h3></div>` : ''}
                <div class="modal-body">${content}</div>
                <div class="modal-footer">
                    ${showCancel ? `<button class="btn btn-secondary modal-cancel">${cancelText}</button>` : ''}
                    <button class="btn btn-primary modal-confirm">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        // 애니메이션
        setTimeout(() => this.modal.classList.add('show'), 10);

        // 이벤트 리스너
        const confirmBtn = this.modal.querySelector('.modal-confirm');
        const cancelBtn = this.modal.querySelector('.modal-cancel');

        confirmBtn.addEventListener('click', () => {
            if (onConfirm) onConfirm();
            this.hide();
        });

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (onCancel) onCancel();
                this.hide();
            });
        }

        // 오버레이 클릭 시 닫기
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                if (onCancel) onCancel();
                this.hide();
            }
        });
    }

    hide() {
        if (!this.modal) return;
        
        this.modal.classList.remove('show');
        setTimeout(() => {
            if (this.modal && this.modal.parentElement) {
                this.modal.remove();
            }
            this.modal = null;
        }, 300);
    }
}

const modal = new Modal();

function showModal(content, options) {
    return modal.show(content, options);
}

function showConfirm(message, onConfirm, onCancel) {
    return modal.show(message, {
        title: '확인',
        confirmText: '확인',
        cancelText: '취소',
        onConfirm,
        onCancel,
        showCancel: true
    });
}

// ========================================
// 6. 툴팁 시스템
// ========================================

function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
            tooltip.style.left = (rect.left + (rect.width - tooltip.offsetWidth) / 2) + 'px';
            
            setTimeout(() => tooltip.classList.add('show'), 10);
            
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.classList.remove('show');
                setTimeout(() => {
                    if (this._tooltip && this._tooltip.parentElement) {
                        this._tooltip.remove();
                    }
                }, 200);
            }
        });
    });
}

// ========================================
// 7. 스크롤 애니메이션
// ========================================

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// ========================================
// 8. 유틸리티 함수
// ========================================

// 디바운스
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 쓰로틀
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 애니메이션 딜레이
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 로컬 스토리지 헬퍼
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    }
};

// ========================================
// 9. 페이지 로드 시 초기화
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // 툴팁 초기화
    initTooltips();
    
    // 스크롤 애니메이션 초기화
    initScrollAnimations();
    
    // 모든 전화번호 입력 필드 자동 포맷팅
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    });
    
    // 숫자만 입력 가능한 필드
    document.querySelectorAll('input[data-number-only]').forEach(input => {
        input.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });
    });
});

// ========================================
// Export (전역 사용)
// ========================================

window.UIComponents = {
    toast,
    showToast,
    formValidator,
    formatPhoneNumber,
    setupPhoneInput,
    LoadingButton,
    modal,
    showModal,
    showConfirm,
    debounce,
    throttle,
    sleep,
    storage
};
