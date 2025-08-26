<template>
  <div class="user-status">
    <!-- 未登录状态 -->
    <div v-if="!isLoggedIn" class="login-section">
      <button class="btn-login" @click="showLoginModal">
        <span class="login-icon">👤</span>
        登录
      </button>
    </div>
    
    <!-- 已登录状态 -->
    <div v-else class="user-section">
      <div class="user-info" @click="toggleDropdown">
        <img 
          :src="avatarUrl" 
          :alt="user.nickname || user.username"
          class="user-avatar"
          :class="{
            'government-border': user.userType === 'government',
            'citizen-border': user.userType === 'citizen'
          }"
        >
        <div class="user-details">
          <div class="user-name">{{ user.nickname || user.username }}</div>
          <div class="user-type" :class="user.userType">
            {{ user.userType === 'government' ? '政府用户' : '普通用户' }}
          </div>
        </div>
        <span class="dropdown-arrow" :class="{ 'open': showDropdown }">▼</span>
      </div>
      
      <!-- 下拉菜单 -->
      <div v-if="showDropdown" class="dropdown-menu" @click.stop>
        <div class="dropdown-item" @click="showUserProfile">
          <span class="item-icon">👤</span>
          个人信息
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item logout" @click="handleLogout">
          <span class="item-icon">🚪</span>
          退出登录
        </div>
      </div>
    </div>
    
    <!-- 登录弹窗 -->
    <LoginModal 
      :visible="loginModalVisible" 
      @close="loginModalVisible = false"
      @login-success="handleLoginSuccess"
    />
    
    <!-- 用户信息弹窗 -->
    <UserProfile 
      :visible="profileModalVisible" 
      :user="user"
      @close="profileModalVisible = false"
      @logout="handleLogout"
      @user-updated="handleUserUpdated"
    />
  </div>
</template>

<script>
import authService from '@/services/auth.service';
import LoginModal from './LoginModal.vue';
import UserProfile from './UserProfile.vue';

export default {
  name: 'UserStatus',
  components: {
    LoginModal,
    UserProfile
  },
  data() {
    return {
      user: null,
      showDropdown: false,
      loginModalVisible: false,
      profileModalVisible: false
    }
  },
  computed: {
    isLoggedIn() {
      return authService.isAuthenticated() && this.user;
    },
    avatarUrl() {
      return authService.getAvatarUrl();
    }
  },
  mounted() {
    this.checkAuthStatus();
    // 点击外部关闭下拉菜单
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    async checkAuthStatus() {
      if (authService.isAuthenticated()) {
        this.user = authService.getUser();
        // 可以在这里调用API获取最新用户信息
        // const currentUser = await authService.getCurrentUser();
        // if (currentUser) {
        //   this.user = currentUser;
        // }
      }
    },
    
    showLoginModal() {
      this.loginModalVisible = true;
    },
    
    showUserProfile() {
      this.showDropdown = false;
      this.profileModalVisible = true;
    },
    
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.showDropdown = false;
      }
    },
    
    handleLoginSuccess(user) {
      this.user = user;
      this.loginModalVisible = false;
      this.$emit('login-success', user);
    },
    
    handleLogout() {
      if (confirm('确定要退出登录吗？')) {
        authService.logout();
        this.user = null;
        this.showDropdown = false;
        this.profileModalVisible = false;
        this.$emit('logout');
      }
    },
    
    handleUserUpdated(updatedUser) {
      this.user = updatedUser;
      // 更新本地存储
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.$emit('user-updated', updatedUser);
    }
  }
}
</script>

<style scoped>
.user-status {
  position: relative;
  display: flex;
  align-items: center;
}

/* 登录按钮样式 */
.login-section {
  display: flex;
  align-items: center;
}

.btn-login {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #4096ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-login:hover {
  background: #1677ff;
  transform: translateY(-1px);
}

.login-icon {
  font-size: 16px;
}

/* 用户信息样式 */
.user-section {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 180px;
}

.user-info:hover {
  background: rgba(0, 0, 0, 0.05);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.user-avatar.government-border {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 1px rgba(255, 77, 79, 0.3);
}

.user-avatar.citizen-border {
  border-color: #faad14;
  box-shadow: 0 0 0 1px rgba(250, 173, 20, 0.3);
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.2;
}

.user-type {
  font-size: 11px;
  color: #666;
  line-height: 1;
}

.user-type.government {
  color: #ff4d4f;
}

.user-type.citizen {
  color: #faad14;
}

.dropdown-arrow {
  font-size: 10px;
  color: #999;
  transition: transform 0.2s;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

/* 下拉菜单样式 */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 160px;
  margin-top: 4px;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
  color: #333;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.logout {
  color: #ff4d4f;
}

.dropdown-item.logout:hover {
  background: #fff2f0;
}

.item-icon {
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.dropdown-divider {
  height: 1px;
  background: #e8e8e8;
  margin: 4px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-info {
    min-width: auto;
    padding: 6px 8px;
  }
  
  .user-details {
    display: none;
  }
  
  .dropdown-menu {
    right: -20px;
  }
}

/* 动画效果 */
.dropdown-menu {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>