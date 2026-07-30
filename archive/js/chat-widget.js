/**
 * 채팅 위젯 시스템
 * zuzu.network 스타일 스레드형 대화
 * 프로토타입 버전 (localStorage 기반)
 */

class ChatWidget {
    constructor(orderId) {
        this.orderId = orderId || 'demo-12345';
        this.isOpen = false;
        this.unreadCount = 0;
        this.messages = [];
        this.currentUser = {
            id: 'user-1',
            name: '사용자',
            type: 'user'
        };
        this.expert = {
            id: 'expert-1',
            name: '김철수 변호사',
            type: 'expert',
            avatar: 'https://ui-avatars.com/api/?name=김철수&background=0064FF&color=fff'
        };
        
        this.init();
    }
    
    init() {
        console.log('채팅 위젯 초기화 중...');
        this.loadMessages();
        this.createWidgetButton();
        this.createChatPanel();
        this.attachEvents();
        this.updateUnreadCount();
        
        // 데모용: 초기 메시지가 없으면 샘플 메시지 추가
        if (this.messages.length === 0) {
            this.addDemoMessages();
        }
    }
    
    createWidgetButton() {
        const button = document.createElement('button');
        button.id = 'chat-widget-btn';
        button.className = 'chat-widget-button';
        button.innerHTML = `
            <i class="fas fa-comments"></i>
            <span class="chat-badge hidden">0</span>
        `;
        document.body.appendChild(button);
    }
    
    createChatPanel() {
        const panel = document.createElement('div');
        panel.id = 'chat-panel';
        panel.className = 'chat-panel hidden';
        panel.innerHTML = `
            <!-- 헤더 -->
            <div class="chat-header">
                <div class="chat-header-info">
                    <div class="chat-service-name" data-i18n="chat.header.service">F-6 비자 신청</div>
                    <div class="chat-order-id">#${this.orderId}</div>
                </div>
                <button class="chat-close-btn" id="chat-close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <!-- 메시지 영역 -->
            <div class="chat-messages" id="chat-messages">
                <!-- 메시지가 동적으로 추가됨 -->
            </div>
            
            <!-- 타이핑 인디케이터 -->
            <div class="typing-indicator hidden" id="typing-indicator">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span class="typing-text" data-i18n="chat.typing">입력 중...</span>
            </div>
            
            <!-- 입력 영역 -->
            <div class="chat-input-area">
                <button class="chat-attach-btn" id="chat-attach-btn" title="파일 첨부">
                    <i class="fas fa-paperclip"></i>
                </button>
                <input 
                    type="text" 
                    class="chat-input" 
                    id="chat-input"
                    placeholder="메시지를 입력하세요..."
                    data-i18n-placeholder="chat.input.placeholder"
                />
                <button class="chat-send-btn" id="chat-send-btn" title="전송">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;
        document.body.appendChild(panel);
    }
    
    attachEvents() {
        // 위젯 버튼 클릭
        const widgetBtn = document.getElementById('chat-widget-btn');
        widgetBtn.addEventListener('click', () => this.toggleChat());
        
        // 닫기 버튼
        const closeBtn = document.getElementById('chat-close-btn');
        closeBtn.addEventListener('click', () => this.toggleChat());
        
        // 전송 버튼
        const sendBtn = document.getElementById('chat-send-btn');
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        // 입력창 엔터키
        const input = document.getElementById('chat-input');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 첨부 버튼 (데모용)
        const attachBtn = document.getElementById('chat-attach-btn');
        attachBtn.addEventListener('click', () => {
            alert('파일 업로드 기능은 백엔드 통합 후 사용 가능합니다.');
        });
    }
    
    toggleChat() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('chat-panel');
        panel.classList.toggle('hidden');
        
        if (this.isOpen) {
            this.renderMessages();
            this.markAsRead();
            document.getElementById('chat-input').focus();
        }
    }
    
    sendMessage() {
        const input = document.getElementById('chat-input');
        const content = input.value.trim();
        
        if (!content) return;
        
        const message = {
            id: `msg-${Date.now()}`,
            orderId: this.orderId,
            sender: this.currentUser,
            content: content,
            timestamp: Date.now(),
            read: true
        };
        
        this.messages.push(message);
        this.saveMessages();
        this.renderMessages();
        
        input.value = '';
        
        // 데모용: 자동 응답 (3초 후)
        this.showTypingIndicator();
        setTimeout(() => {
            this.simulateExpertReply(content);
        }, 3000);
    }
    
    simulateExpertReply(userMessage) {
        const replies = [
            '네, 말씀하신 내용을 확인했습니다. 곧 처리해드리겠습니다.',
            '추가로 필요한 서류를 안내해드리겠습니다.',
            '문의하신 내용은 영업일 기준 1~2일 내에 답변드리겠습니다.',
            '감사합니다. 더 궁금하신 점이 있으시면 언제든 말씀해주세요.'
        ];
        
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        const message = {
            id: `msg-${Date.now()}`,
            orderId: this.orderId,
            sender: this.expert,
            content: randomReply,
            timestamp: Date.now(),
            read: false
        };
        
        this.hideTypingIndicator();
        this.messages.push(message);
        this.saveMessages();
        
        if (this.isOpen) {
            this.renderMessages();
        } else {
            this.updateUnreadCount();
        }
    }
    
    showTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        indicator.classList.remove('hidden');
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        indicator.classList.add('hidden');
    }
    
    renderMessages() {
        const container = document.getElementById('chat-messages');
        container.innerHTML = this.messages.map(msg => this.createMessageHTML(msg)).join('');
        
        // 스크롤을 맨 아래로
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }
    
    createMessageHTML(message) {
        const isUser = message.sender.type === 'user';
        const time = this.formatTime(message.timestamp);
        
        if (isUser) {
            return `
                <div class="chat-message user">
                    <div class="message-content">
                        <div class="message-bubble">${this.escapeHTML(message.content)}</div>
                        <div class="message-time">${time}</div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="chat-message expert">
                    <div class="message-avatar">
                        <img src="${message.sender.avatar}" alt="${message.sender.name}" />
                    </div>
                    <div class="message-content">
                        <div class="message-author">${message.sender.name}</div>
                        <div class="message-bubble">${this.escapeHTML(message.content)}</div>
                        <div class="message-time">${time}</div>
                    </div>
                </div>
            `;
        }
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? '오후' : '오전';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
        
        return `${ampm} ${displayHours}:${displayMinutes}`;
    }
    
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    loadMessages() {
        const stored = localStorage.getItem(`chat_messages_${this.orderId}`);
        if (stored) {
            try {
                this.messages = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to load messages:', e);
                this.messages = [];
            }
        }
    }
    
    saveMessages() {
        localStorage.setItem(`chat_messages_${this.orderId}`, JSON.stringify(this.messages));
    }
    
    markAsRead() {
        let updated = false;
        this.messages.forEach(msg => {
            if (!msg.read && msg.sender.type !== 'user') {
                msg.read = true;
                updated = true;
            }
        });
        
        if (updated) {
            this.saveMessages();
            this.updateUnreadCount();
        }
    }
    
    updateUnreadCount() {
        const count = this.messages.filter(msg => !msg.read && msg.sender.type !== 'user').length;
        this.unreadCount = count;
        
        const badge = document.querySelector('.chat-badge');
        if (badge) {
            badge.textContent = count;
            badge.classList.toggle('hidden', count === 0);
        }
    }
    
    addDemoMessages() {
        const demoMessages = [
            {
                id: 'demo-1',
                orderId: this.orderId,
                sender: this.expert,
                content: '안녕하세요! F-6 비자 신청 건으로 연락드립니다. 서류를 확인한 결과 추가로 필요한 서류가 있습니다.',
                timestamp: Date.now() - 3600000, // 1시간 전
                read: false
            },
            {
                id: 'demo-2',
                orderId: this.orderId,
                sender: this.expert,
                content: '다음 서류를 준비해주시기 바랍니다:\n1. 결혼증명서 원본\n2. 배우자 가족관계증명서\n3. 소득증명서류 (최근 3개월)',
                timestamp: Date.now() - 3500000,
                read: false
            },
            {
                id: 'demo-3',
                orderId: this.orderId,
                sender: this.expert,
                content: '서류를 준비하시는 데 평균 1~2주 정도 소요됩니다. 궁금하신 점이 있으시면 언제든 문의해주세요!',
                timestamp: Date.now() - 3400000,
                read: false
            }
        ];
        
        this.messages = demoMessages;
        this.saveMessages();
        this.updateUnreadCount();
    }
    
    clearChat() {
        if (confirm('모든 채팅 내역을 삭제하시겠습니까?')) {
            this.messages = [];
            this.saveMessages();
            this.renderMessages();
            this.updateUnreadCount();
        }
    }
}

// 전역 변수로 노출
window.ChatWidget = ChatWidget;

// 자동 초기화 (orderId가 URL 파라미터에 있을 경우)
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId') || urlParams.get('order_id');
    
    if (orderId) {
        console.log('채팅 위젯 자동 시작:', orderId);
        window.chatWidget = new ChatWidget(orderId);
    }
});

// 개발자 도구용 헬퍼 함수
window.initChatDemo = () => {
    console.log('데모 채팅 위젯 시작...');
    window.chatWidget = new ChatWidget('demo-12345');
};

window.clearChatDemo = () => {
    if (window.chatWidget) {
        window.chatWidget.clearChat();
    }
};
