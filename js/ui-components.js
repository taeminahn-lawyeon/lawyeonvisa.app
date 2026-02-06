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

// ============================================
// HTML Sanitization Utilities (XSS Prevention)
// ============================================

/**
 * Escape HTML special characters to prevent XSS
 * Use for any user-supplied text that will be inserted into innerHTML
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/**
 * Sanitize HTML content - removes dangerous tags and attributes
 * Allows safe formatting tags (from Quill editor, admin messages, etc.)
 * while stripping script injection vectors
 */
function sanitizeHtml(html) {
    if (!html) return '';

    // Remove <script> tags and content
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handler attributes (onclick, onerror, onload, etc.)
    html = html.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

    // Remove javascript: and data: URLs in href/src attributes
    html = html.replace(/(href|src|action)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '$1=""');
    html = html.replace(/(href|src|action)\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi, '$1=""');

    // Remove <iframe>, <object>, <embed>, <form>, <input>, <textarea> tags
    html = html.replace(/<(iframe|object|embed|form|input|textarea|meta|link|base)\b[^>]*\/?>/gi, '');
    html = html.replace(/<\/(iframe|object|embed|form|input|textarea)>/gi, '');

    // Remove <style> tags with content (can be used for CSS injection)
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    return html;
}

/**
 * Sanitize URL - only allow http, https, mailto protocols
 */
function sanitizeUrl(url) {
    if (!url) return '';
    try {
        const parsed = new URL(url, window.location.origin);
        if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
            return url;
        }
        return '';
    } catch {
        return '';
    }
}

window.escapeHtml = escapeHtml;
window.sanitizeHtml = sanitizeHtml;
window.sanitizeUrl = sanitizeUrl;
