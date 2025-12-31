<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="profile-modal" @click.stop>
      <div class="modal-header">
        <h2>用户信息</h2>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body" v-if="user">
        <!-- 用户头像和基本信息 -->
        <div class="user-avatar-section">
          <div class="avatar-container">
            <img 
              :src="avatarUrl" 
              :alt="user.nickName || user.phone"
              class="user-avatar"
              :class="{ 'government-border': user.role === 'government', 'citizen-border': user.role === 'normal' }"
            >
            <div class="user-type-badge" :class="user.role">
              {{ user.role === 'government' ? '政府' : '普通' }}
            </div>
          </div>
          <div class="user-basic-info">
            <h3>{{ user.nickName || user.phone }}</h3>
            <p class="user-type-desc">
              {{ user.role === 'government' ? '政府用户' : '普通用户' }}
            </p>
          </div>
        </div>
        
        <!-- 用户详细信息 -->
        <div class="user-details">
          <div class="detail-item">
            <label>手机号</label>
            <div class="detail-value">{{ user.phone }}</div>
          </div>
          
          <div class="detail-item">
            <label>昵称</label>
            <div class="detail-value">
              <span>{{ user.nickName || '未设置' }}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <label>用户类型</label>
            <div class="detail-value">
              <span class="type-badge" :class="user.role">
                {{ user.role === 'government' ? '🏛️ 政府用户' : '👤 普通用户' }}
              </span>
            </div>
          </div>
          
          <div class="detail-item">
            <label>注册时间</label>
            <div class="detail-value">{{ formatDate(user.createdAt) }}</div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-logout" @click="$emit('logout')">退出登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserProfile',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    avatarUrl() {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user?.nickName || 'User')}&background=random&color=fff&size=40`;
    }
  },
  methods: {
    handleOverlayClick() {
      this.$emit('close');
    },
    formatDate(dateStr) {
      if (!dateStr) return '未知';
      return new Date(dateStr).toLocaleString();
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.profile-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.btn-close:hover {
  background: #f5f5f5;
  color: #666;
}

.modal-body {
  padding: 24px;
}

.user-avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.avatar-container {
  position: relative;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid transparent;
}

.user-avatar.government-border {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}

.user-avatar.citizen-border {
  border-color: #faad14;
  box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.2);
}

.user-type-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: white;
  border: 2px solid white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 500;
  color: white;
}

.user-type-badge.government {
  background: #ff4d4f;
}

.user-type-badge.citizen {
  background: #faad14;
}

.user-basic-info h3 {
  margin: 0 0 4px;
  color: #333;
  font-size: 18px;
}

.user-type-desc {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item label {
  font-weight: 500;
  color: #666;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: #333;
  font-size: 14px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  position: relative;
}

.detail-value.editable {
  cursor: pointer;
  transition: background-color 0.2s;
}

.detail-value.editable:hover {
  background: #e9ecef;
}

.detail-value.editable .edit-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 12px;
}

.detail-value.editable:hover .edit-icon {
  opacity: 1;
}

.detail-value input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #333;
  padding: 0;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge.government {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.type-badge.citizen {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.profile-actions {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.btn-logout {
  padding: 10px 24px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-logout:hover {
  background: #ff7875;
}

.error-message {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  padding: 12px 16px;
  border-radius: 6px;
  margin: 16px 24px 0;
  font-size: 14px;
}

.success-message {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
  padding: 12px 16px;
  border-radius: 6px;
  margin: 16px 24px 0;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 40px 24px;
  color: #999;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}
</style>