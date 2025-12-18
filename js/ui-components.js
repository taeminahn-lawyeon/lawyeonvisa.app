/**
 * UI Components Library
 * 재사용 가능한 UI 컴포넌트 및 유틸리티 함수
 */

// Toast notification system
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
        
        setTimeout(() => toast.classList.add('show'), 10);
        
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

const toast = new ToastNotification();

function showToast(message, type = 'info', duration = 4000) {
    return toast.show(message, type, duration);
}

function closeToast(button) {
    const toastElement = button.closest('.toast');
    toast.hide(toastElement);
}

window.showToast = showToast;
window.closeToast = closeToast;
