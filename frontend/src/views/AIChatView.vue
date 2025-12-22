<template>
  <div class="ai-chat-container">
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <h3>历史对话</h3>
        <button class="new-chat-btn" @click="startNewChat">+ 新对话</button>
      </div>
      <div class="history-list">
        <div 
          v-for="(session, index) in historySessions" 
          :key="index" 
          class="history-item"
          :class="{ active: currentSessionId === session.id }"
          @click="loadSession(session.id)"
        >
          <span class="history-title">{{ session.title }}</span>
          <span class="history-date">{{ session.date }}</span>
        </div>
      </div>
    </div>
    
    <div class="chat-main">
      <div class="chat-header">
        <h2>AI 智能助手</h2>
        <span class="model-info">Model: GPT-3.5</span>
      </div>
      
      <div class="messages-container" ref="messagesContainer">
        <div v-if="messages.length === 0" class="empty-state">
          <div class="empty-icon">🤖</div>
          <h3>有什么可以帮你的吗？</h3>
          <p>你可以问我关于城市规划、项目管理或任何其他问题。</p>
        </div>
        
        <div v-for="(msg, index) in messages" :key="index" :class="['message-wrapper', msg.type]">
          <div class="avatar">
            {{ msg.type === 'user' ? '👤' : '🤖' }}
          </div>
          <div class="message-content">
            <div class="message-text">{{ msg.text }}</div>
            <div class="message-time">{{ msg.time }}</div>
          </div>
        </div>
        
        <div v-if="loading" class="message-wrapper ai">
          <div class="avatar">🤖</div>
          <div class="message-content loading">
            <div class="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="input-area">
        <div class="input-wrapper">
          <textarea 
            v-model="newMessage" 
            @keydown.enter.prevent="sendMessage" 
            placeholder="输入您的问题... (Shift + Enter 换行)"
            :disabled="loading"
          ></textarea>
          <button class="send-btn" @click="sendMessage" :disabled="loading || !newMessage.trim()">
            发送
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChatService from '../services/chat.service';

export default {
  name: 'AIChatView',
  data() {
    return {
      newMessage: '',
      loading: false,
      currentSessionId: 1,
      historySessions: [
        { id: 1, title: '关于智慧城市的讨论', date: '今天' },
        { id: 2, title: '项目进度查询', date: '昨天' }
      ],
      messages: [
        { type: 'ai', text: '你好！我是你的AI助手，有什么可以帮你的吗？', time: new Date().toLocaleTimeString() }
      ]
    };
  },
  methods: {
    startNewChat() {
      this.messages = [{ type: 'ai', text: '你好！我是你的AI助手，有什么可以帮你的吗？', time: new Date().toLocaleTimeString() }];
      this.currentSessionId = Date.now();
      // In a real app, you would create a new session in the backend here
    },
    loadSession(id) {
      this.currentSessionId = id;
      // In a real app, you would load messages for this session from the backend
      console.log('Loading session:', id);
    },
    async sendMessage() {
      if (!this.newMessage.trim() || this.loading) return;

      const userMsg = this.newMessage;
      this.messages.push({ 
        type: 'user', 
        text: userMsg,
        time: new Date().toLocaleTimeString()
      });
      this.newMessage = '';
      this.loading = true;

      this.$nextTick(() => {
        this.scrollToBottom();
      });

      try {
        const response = await ChatService.sendMessage(userMsg);
        this.messages.push({ 
          type: 'ai', 
          text: response.data,
          time: new Date().toLocaleTimeString()
        });
      } catch (error) {
        console.error('Chat error:', error);
        this.messages.push({ 
          type: 'ai', 
          text: '抱歉，我现在无法回答，请稍后再试。',
          time: new Date().toLocaleTimeString()
        });
      } finally {
        this.loading = false;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }
};
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  height: calc(100vh - 120px); /* Adjust based on header/footer height */
  background-color: #f5f7fa;
  margin: -20px; /* Counteract container padding if necessary */
}

/* Sidebar Styles */
.chat-sidebar {
  width: 260px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ddd;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #34495e;
}

.sidebar-header h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
}

.new-chat-btn {
  width: 100%;
  padding: 10px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.new-chat-btn:hover {
  background-color: #66b1ff;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.history-item {
  padding: 12px;
  margin-bottom: 8px;
  background-color: #34495e;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
}

.history-item:hover {
  background-color: #405d7a;
}

.history-item.active {
  background-color: #409eff;
}

.history-title {
  font-size: 14px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-date {
  font-size: 12px;
  color: #bdc3c7;
}

/* Main Chat Area Styles */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.chat-header {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
}

.chat-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.model-info {
  font-size: 12px;
  color: #909399;
  background-color: #f4f4f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.messages-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f9fafc;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.message-wrapper {
  display: flex;
  margin-bottom: 20px;
  max-width: 80%;
}

.message-wrapper.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-wrapper.ai {
  margin-right: auto;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e6e8eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin: 0 10px;
  flex-shrink: 0;
}

.message-wrapper.user .avatar {
  background-color: #409eff;
  color: white;
}

.message-content {
  background-color: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  position: relative;
}

.message-wrapper.user .message-content {
  background-color: #409eff;
  color: white;
  border-top-right-radius: 2px;
}

.message-wrapper.ai .message-content {
  background-color: white;
  color: #303133;
  border-top-left-radius: 2px;
}

.message-text {
  font-size: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message-time {
  font-size: 12px;
  margin-top: 5px;
  opacity: 0.7;
  text-align: right;
}

/* Input Area Styles */
.input-area {
  padding: 20px;
  background-color: white;
  border-top: 1px solid #ebeef5;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  background-color: white;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 10px;
  transition: border-color 0.3s;
}

.input-wrapper:focus-within {
  border-color: #409eff;
}

textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  height: 60px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
}

.send-btn {
  align-self: flex-end;
  padding: 8px 20px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.send-btn:hover {
  background-color: #66b1ff;
}

.send-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background-color: #909399;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>
