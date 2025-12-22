<template>
  <div class="chat-container" :class="{ 'chat-open': isOpen }">
    <div class="chat-header" @click="toggleChat">
      <span>AI 助手</span>
      <span class="toggle-icon">{{ isOpen ? '▼' : '▲' }}</span>
    </div>
    <div class="chat-body" v-if="isOpen">
      <div class="messages" ref="messagesContainer">
        <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.type]">
          <div class="message-content">{{ msg.text }}</div>
        </div>
        <div v-if="loading" class="message ai">
          <div class="message-content">思考中...</div>
        </div>
      </div>
      <div class="input-area">
        <input 
          v-model="newMessage" 
          @keyup.enter="sendMessage" 
          placeholder="输入您的问题..."
          :disabled="loading"
        />
        <button @click="sendMessage" :disabled="loading || !newMessage.trim()">发送</button>
      </div>
    </div>
  </div>
</template>

<script>
import ChatService from '../services/chat.service';

export default {
  name: 'ChatComponent',
  data() {
    return {
      isOpen: false,
      newMessage: '',
      messages: [
        { type: 'ai', text: '你好！我是你的AI助手，有什么可以帮你的吗？' }
      ],
      loading: false
    };
  },
  methods: {
    toggleChat() {
      this.isOpen = !this.isOpen;
    },
    async sendMessage() {
      if (!this.newMessage.trim()) return;

      const userMsg = this.newMessage;
      this.messages.push({ type: 'user', text: userMsg });
      this.newMessage = '';
      this.loading = true;

      this.$nextTick(() => {
        this.scrollToBottom();
      });

      try {
        const response = await ChatService.sendMessage(userMsg);
        this.messages.push({ type: 'ai', text: response.data });
      } catch (error) {
        console.error('Chat error:', error);
        this.messages.push({ type: 'ai', text: '抱歉，我现在无法回答，请稍后再试。' });
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
.chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

.chat-header {
  background-color: #409eff;
  color: white;
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.chat-body {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

.message {
  margin-bottom: 10px;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.ai {
  justify-content: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
}

.message.user .message-content {
  background-color: #409eff;
  color: white;
  border-bottom-right-radius: 2px;
}

.message.ai .message-content {
  background-color: white;
  color: #333;
  border: 1px solid #e4e7ed;
  border-bottom-left-radius: 2px;
}

.input-area {
  padding: 10px;
  border-top: 1px solid #ebeef5;
  display: flex;
  gap: 10px;
}

.input-area input {
  flex: 1;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
}

.input-area input:focus {
  border-color: #409eff;
}

.input-area button {
  padding: 8px 15px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input-area button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}
</style>
