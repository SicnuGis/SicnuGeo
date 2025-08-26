<template>
  <div class="project-comments">
    <div class="comments-header">
      <h3>项目评论 ({{ comments.length }})</h3>
      <button class="btn-add-comment" @click="showAddComment = !showAddComment">
        {{ showAddComment ? '取消' : '添加评论' }}
      </button>
    </div>

    <!-- 添加评论表单 -->
    <div v-if="showAddComment" class="add-comment-form">
      <div class="user-avatar">
        <img src="/api/placeholder/40/40" alt="用户头像" />
      </div>
      <div class="comment-input">
        <textarea 
          v-model="newComment" 
          placeholder="请输入您的评论..." 
          rows="3"
          maxlength="500"
        ></textarea>
        <div class="comment-actions">
          <span class="char-count">{{ newComment.length }}/500</span>
          <button 
            class="btn-submit" 
            @click="submitComment"
            :disabled="!newComment.trim()"
          >
            发表评论
          </button>
        </div>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comments-list">
      <div v-for="comment in sortedComments" :key="comment.id" class="comment-item">
        <div class="comment-avatar">
          <img :src="comment.userAvatar || '/api/placeholder/40/40'" :alt="comment.userName" />
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="user-name">{{ comment.userName }}</span>
            <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
          </div>
          <div class="comment-text">{{ comment.content }}</div>
          <div class="comment-actions">
            <button 
              class="btn-like" 
              :class="{ liked: comment.isLiked }"
              @click="toggleLike(comment)"
            >
              👍 {{ comment.likes }}
            </button>
            <button class="btn-reply" @click="showReplyForm(comment)">
              回复
            </button>
          </div>

          <!-- 回复表单 -->
          <div v-if="replyingTo === comment.id" class="reply-form">
            <textarea 
              v-model="replyContent" 
              placeholder="回复评论..." 
              rows="2"
              maxlength="300"
            ></textarea>
            <div class="reply-actions">
              <button class="btn-cancel" @click="cancelReply">取消</button>
              <button 
                class="btn-submit" 
                @click="submitReply(comment)"
                :disabled="!replyContent.trim()"
              >
                回复
              </button>
            </div>
          </div>

          <!-- 回复列表 -->
          <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
            <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
              <div class="reply-avatar">
                <img :src="reply.userAvatar || '/api/placeholder/32/32'" :alt="reply.userName" />
              </div>
              <div class="reply-content">
                <div class="reply-header">
                  <span class="user-name">{{ reply.userName }}</span>
                  <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
                </div>
                <div class="reply-text">{{ reply.content }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="comments.length === 0" class="empty-comments">
      <div class="empty-icon">💬</div>
      <p>暂无评论，快来发表第一条评论吧！</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectComments',
  props: {
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      comments: [],
      showAddComment: false,
      newComment: '',
      replyingTo: null,
      replyContent: ''
    }
  },
  computed: {
    sortedComments() {
      return [...this.comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
  },
  mounted() {
    this.loadComments()
  },
  methods: {
    async loadComments() {
      try {
        // 从模拟数据加载评论
        const response = await fetch('/mock/comments.json')
        const allComments = await response.json()
        this.comments = allComments.filter(comment => comment.projectId == this.projectId)
      } catch (error) {
        console.error('加载评论失败:', error)
        this.comments = []
      }
    },

    submitComment() {
      if (!this.newComment.trim()) return

      const newComment = {
        id: Date.now(),
        projectId: this.projectId,
        userId: 'current_user',
        userName: '当前用户',
        userAvatar: '/api/placeholder/40/40',
        content: this.newComment.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        replies: []
      }

      this.comments.unshift(newComment)
      this.newComment = ''
      this.showAddComment = false
    },

    showReplyForm(comment) {
      this.replyingTo = comment.id
      this.replyContent = ''
    },

    cancelReply() {
      this.replyingTo = null
      this.replyContent = ''
    },

    submitReply(comment) {
      if (!this.replyContent.trim()) return

      const newReply = {
        id: Date.now(),
        userId: 'current_user',
        userName: '当前用户',
        userAvatar: '/api/placeholder/32/32',
        content: this.replyContent.trim(),
        createdAt: new Date().toISOString()
      }

      if (!comment.replies) {
        comment.replies = []
      }
      comment.replies.push(newReply)
      
      this.cancelReply()
    },

    toggleLike(comment) {
      comment.isLiked = !comment.isLiked
      comment.likes += comment.isLiked ? 1 : -1
    },

    formatTime(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date
      
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      
      return date.toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
.project-comments {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.comments-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.btn-add-comment {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-add-comment:hover {
  background: #2563eb;
}

.add-comment-form {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-input {
  flex: 1;
}

.comment-input textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
}

.comment-input textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.char-count {
  font-size: 12px;
  color: #6b7280;
}

.btn-submit {
  padding: 8px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #059669;
}

.btn-submit:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.comment-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: #6b7280;
}

.comment-text {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 12px;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.btn-like, .btn-reply {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-like:hover, .btn-reply:hover {
  background: #e5e7eb;
  color: #374151;
}

.btn-like.liked {
  color: #3b82f6;
}

.reply-form {
  margin-top: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.reply-form textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  font-size: 13px;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.btn-cancel {
  padding: 6px 12px;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.replies-list {
  margin-top: 12px;
  padding-left: 16px;
  border-left: 2px solid #e5e7eb;
}

.reply-item {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px;
  background: white;
  border-radius: 6px;
}

.reply-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.reply-time {
  font-size: 11px;
  color: #9ca3af;
}

.reply-text {
  color: #374151;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

.empty-comments {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-comments p {
  margin: 0;
  font-size: 14px;
}
</style>