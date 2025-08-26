<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="profile-modal" @click.stop>
      <div class="modal-header">
        <h2>用户信息</h2>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body" v-if="user && user.username">
        <!-- 用户头像和基本信息 -->
        <div class="user-avatar-section">
          <div class="avatar-container">
            <img 
              :src="avatarUrl" 
              :alt="user.nickname || user.username"
              class="user-avatar"
              :class="{ 'government-border': user.userType === 'government', 'citizen-border': user.userType === 'citizen' }"
            >
            <div class="user-type-badge" :class="user.userType">
              {{ user.userType === 'government' ? '政府' : '普通' }}
            </div>
          </div>
          <div class="user-basic-info">
            <h3>{{ user.nickname || user.username }}</h3>
            <p class="user-type-desc">
              {{ user.userType === 'government' ? '政府用户' : '普通用户' }}
            </p>
          </div>
        </div>
        
        <!-- 用户详细信息 -->
        <div class="user-details">
          <div class="detail-item">
            <label>用户名</label>
            <div class="detail-value">{{ user.username }}</div>
          </div>
          
          <div class="detail-item">
            <label>昵称</label>
            <div class="detail-value editable" @click="startEdit('nickname')">
              <span v-if="!editing.nickname">{{ user.nickname || '未设置' }}</span>
              <input 
                v-else
                type="text" 
                v-model="editForm.nickname" 
                @blur="saveEdit('nickname')"
                @keyup.enter="saveEdit('nickname')"
                @keyup.esc="cancelEdit('nickname')"
                ref="nicknameInput"
              >
              <span class="edit-icon">✏️</span>
            </div>
          </div>
          
          <div class="detail-item">
            <label>邮箱</label>
            <div class="detail-value editable" @click="startEdit('email')">
              <span v-if="!editing.email">{{ user.email }}</span>
              <input 
                v-else
                type="email" 
                v-model="editForm.email" 
                @blur="saveEdit('email')"
                @keyup.enter="saveEdit('email')"
                @keyup.esc="cancelEdit('email')"
                ref="emailInput"
              >
              <span class="edit-icon">✏️</span>
            </div>
          </div>
          
          <div class="detail-item">
            <label>密码</label>
            <div class="detail-value editable" @click="startEdit('password')">
              <span v-if="!editing.password">••••••••</span>
              <input 
                v-else
                type="password" 
                v-model="editForm.password" 
                placeholder="输入新密码"
                @blur="saveEdit('password')"
                @keyup.enter="saveEdit('password')"
                @keyup.esc="cancelEdit('password')"
                ref="passwordInput"
              >
              <span class="edit-icon">✏️</span>
            </div>
          </div>
          
          <div class="detail-item">
            <label>用户类型</label>
            <div class="detail-value">
              <span class="type-badge" :class="user.userType">
                {{ user.userType === 'government' ? '🏛️ 政府用户' : '👤 普通用户' }}
              </span>
            </div>
          </div>
          
          <div class="detail-item">
            <label>注册时间</label>
            <div class="detail-value">{{ formatDate(user.createdAt) }}</div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="profile-actions">
          <button class="btn-logout" @click="handleLogout">
            退出登录
          </button>
        </div>
      </div>
      
      <!-- 用户信息不存在时的提示 -->
      <div v-else class="empty-state">
        <p>用户信息不可用</p>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <!-- 成功提示 -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/auth.service';

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
  data() {
    return {
      editing: {
        nickname: false,
        email: false,
        password: false
      },
      editForm: {
        nickname: '',
        email: '',
        password: ''
      },
      errorMessage: '',
      successMessage: ''
    }
  },
  computed: {
    avatarUrl() {
      return authService.getAvatarUrl();
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.resetForm();
      }
    }
  },
  methods: {
    handleOverlayClick() {
      this.$emit('close');
    },
    
    resetForm() {
      this.editing = {
        nickname: false,
        email: false,
        password: false
      };
      this.editForm = {
        nickname: this.user.nickname || '',
        email: this.user.email || '',
        password: ''
      };
      this.errorMessage = '';
      this.successMessage = '';
    },
    
    startEdit(field) {
      this.editing[field] = true;
      this.editForm[field] = field === 'password' ? '' : this.user[field] || '';
      
      // 聚焦到输入框
      this.$nextTick(() => {
        const inputRef = this.$refs[field + 'Input'];
        if (inputRef) {
          inputRef.focus();
          if (field !== 'password') {
            inputRef.select();
          }
        }
      });
    },
    
    cancelEdit(field) {
      this.editing[field] = false;
      this.editForm[field] = field === 'password' ? '' : this.user[field] || '';
    },
    
    async saveEdit(field) {
      if (!this.editForm[field] && field !== 'nickname') {
        this.cancelEdit(field);
        return;
      }
      
      try {
        const updateData = {};
        updateData[field] = this.editForm[field];
        
        // 这里应该调用真实的API，现在使用模拟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 更新本地用户信息
        this.$emit('user-updated', { ...this.user, [field]: this.editForm[field] });
        
        this.editing[field] = false;
        this.successMessage = '更新成功！';
        
        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
        
      } catch (error) {
        this.errorMessage = error.message || '更新失败，请重试';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    },
    
    handleLogout() {
      if (confirm('确定要退出登录吗？')) {
        authService.logout();
        this.$emit('logout');
        this.$emit('close');
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '未知';
      try {
        return new Date(dateString).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch {
        return '未知';
      }
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