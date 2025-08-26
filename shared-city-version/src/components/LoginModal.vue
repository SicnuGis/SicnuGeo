<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="login-modal" @click.stop>
      <div class="modal-header">
        <h2>{{ isLogin ? '用户登录' : '用户注册' }}</h2>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <!-- 登录表单 -->
        <form v-if="isLogin" @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="username">用户名</label>
            <input 
              type="text" 
              id="username" 
              v-model="loginForm.username" 
              required 
              placeholder="请输入用户名"
            >
          </div>
          
          <div class="form-group">
            <label for="password">密码</label>
            <input 
              type="password" 
              id="password" 
              v-model="loginForm.password" 
              required 
              placeholder="请输入密码"
            >
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </div>
          
          <div class="form-footer">
            <p>还没有账号？<a href="#" @click.prevent="isLogin = false">立即注册</a></p>
          </div>
        </form>
        
        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="reg-username">用户名</label>
            <input 
              type="text" 
              id="reg-username" 
              v-model="registerForm.username" 
              required 
              placeholder="请输入用户名"
            >
          </div>
          
          <div class="form-group">
            <label for="reg-nickname">昵称</label>
            <input 
              type="text" 
              id="reg-nickname" 
              v-model="registerForm.nickname" 
              placeholder="请输入昵称（可选）"
            >
          </div>
          
          <div class="form-group">
            <label for="reg-email">邮箱</label>
            <input 
              type="email" 
              id="reg-email" 
              v-model="registerForm.email" 
              required 
              placeholder="请输入邮箱"
            >
          </div>
          
          <div class="form-group">
            <label for="reg-password">密码</label>
            <input 
              type="password" 
              id="reg-password" 
              v-model="registerForm.password" 
              required 
              placeholder="请输入密码（至少6位）"
            >
          </div>
          
          <div class="form-group">
            <label for="reg-confirm-password">确认密码</label>
            <input 
              type="password" 
              id="reg-confirm-password" 
              v-model="registerForm.confirmPassword" 
              required 
              placeholder="请再次输入密码"
            >
          </div>
          
          <div class="form-group">
            <label>用户类型</label>
            <div class="user-type-selector">
              <label class="radio-option">
                <input 
                  type="radio" 
                  value="citizen" 
                  v-model="registerForm.userType"
                >
                <span class="radio-label">
                  <span class="type-icon citizen">👤</span>
                  普通用户
                </span>
              </label>
              <label class="radio-option">
                <input 
                  type="radio" 
                  value="government" 
                  v-model="registerForm.userType"
                >
                <span class="radio-label">
                  <span class="type-icon government">🏛️</span>
                  政府用户
                </span>
              </label>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? '注册中...' : '注册' }}
            </button>
          </div>
          
          <div class="form-footer">
            <p>已有账号？<a href="#" @click.prevent="isLogin = true">立即登录</a></p>
          </div>
        </form>
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
  name: 'LoginModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLogin: true,
      loading: false,
      errorMessage: '',
      successMessage: '',
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        nickname: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'citizen'
      }
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.resetForms();
      }
    }
  },
  methods: {
    handleOverlayClick() {
      this.$emit('close');
    },
    
    resetForms() {
      this.isLogin = true;
      this.loading = false;
      this.errorMessage = '';
      this.successMessage = '';
      this.loginForm = {
        username: '',
        password: ''
      };
      this.registerForm = {
        username: '',
        nickname: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'citizen'
      };
    },
    
    async handleLogin() {
      this.loading = true;
      this.errorMessage = '';
      
      try {
        // 使用mock登录进行测试
        const result = await authService.mockLogin(this.loginForm);
        this.successMessage = '登录成功！';
        
        // 延迟关闭弹窗，让用户看到成功提示
        setTimeout(() => {
          this.$emit('login-success', result.user);
          this.$emit('close');
        }, 1000);
        
      } catch (error) {
        this.errorMessage = error.message || '登录失败，请重试';
      } finally {
        this.loading = false;
      }
    },
    
    async handleRegister() {
      this.loading = true;
      this.errorMessage = '';
      
      // 验证密码确认
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.errorMessage = '两次输入的密码不一致';
        this.loading = false;
        return;
      }
      
      try {
        // 使用mock注册进行测试
        const result = await authService.mockRegister(this.registerForm);
        this.successMessage = result.message || '注册成功！请登录';
        
        // 延迟切换到登录表单
        setTimeout(() => {
          this.isLogin = true;
          this.successMessage = '';
        }, 2000);
        
      } catch (error) {
        this.errorMessage = error.message || '注册失败，请重试';
      } finally {
        this.loading = false;
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

.login-modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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
}

.btn-close:hover {
  color: #666;
}

.modal-body {
  padding: 24px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #4096ff;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.1);
}

.user-type-selector {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: all 0.2s;
  flex: 1;
}

.radio-option:hover {
  border-color: #4096ff;
  background: #f8f9ff;
}

.radio-option input[type="radio"] {
  margin-right: 8px;
}

.radio-option input[type="radio"]:checked + .radio-label {
  color: #4096ff;
  font-weight: 500;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.type-icon {
  font-size: 16px;
}

.form-actions {
  margin-top: 8px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: #4096ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #1677ff;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}

.form-footer a {
  color: #4096ff;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}

.error-message {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  padding: 12px 16px;
  border-radius: 4px;
  margin: 16px 24px 0;
  font-size: 14px;
}

.success-message {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
  padding: 12px 16px;
  border-radius: 4px;
  margin: 16px 24px 0;
  font-size: 14px;
}
</style>