<template>
  <div class="login-container">
    <div class="login-box glass-effect">
      <h2>用户登录</h2>
      <div class="form-group">
        <input v-model="phone" type="text" placeholder="请输入手机号" />
      </div>
      <div class="form-group code-group">
        <input v-model="code" type="text" placeholder="请输入验证码" />
        <button @click="sendCode" :disabled="countdown > 0" class="btn-code">
          {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
        </button>
      </div>
      <button @click="handleLogin" class="btn-login" :disabled="loading">
        {{ loading ? '登录中...' : '登录 / 注册' }}
      </button>
    </div>
  </div>
</template>

<script>
import AuthService from '@/services/auth.service';
import { useUserStore } from '@/store/index';

export default {
  name: 'LoginView',
  data() {
    return {
      phone: '',
      code: '',
      countdown: 0,
      loading: false
    };
  },
  methods: {
    async sendCode() {
      if (!this.phone) {
        this.$message.error('请输入手机号');
        return;
      }
      try {
        await AuthService.sendCode(this.phone);
        this.$message.success('验证码已发送');
        this.countdown = 60;
        const timer = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) clearInterval(timer);
        }, 1000);
      } catch (error) {
        this.$message.error('发送失败: ' + error.message);
      }
    },
    async handleLogin() {
      if (!this.phone || !this.code) {
        this.$message.error('请输入手机号和验证码');
        return;
      }
      this.loading = true;
      try {
        const user = await AuthService.login(this.phone, this.code);
        const store = useUserStore();
        store.setCurrentUser(user);
        this.$message.success('登录成功');
        this.$router.push('/');
      } catch (error) {
        this.$message.error('登录失败: ' + error.message);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

h2 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus {
  border-color: #409eff;
}

.code-group {
  display: flex;
  gap: 10px;
}

.btn-code {
  width: 120px;
  padding: 0;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  color: #606266;
  cursor: pointer;
}

.btn-code:disabled {
  cursor: not-allowed;
  color: #c0c4cc;
}

.btn-login {
  width: 100%;
  padding: 12px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-login:hover {
  background: #66b1ff;
}

.btn-login:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}
</style>