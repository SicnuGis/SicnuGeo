// 用户认证服务
const API_BASE_URL = '/api/user';

class AuthService {
  constructor() {
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  // 发送验证码
  async sendCode(phone) {
    try {
      const response = await fetch(`${API_BASE_URL}/code?phone=${phone}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || '发送验证码失败');
      }
      return true;
    } catch (error) {
      console.error('Send code error:', error);
      throw error;
    }
  }

  // 用户登录
  async login(phone, code) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, code })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || '登录失败');
      }

      const user = await response.json();
      
      // 保存用户信息
      this.user = user;
      localStorage.setItem('user', JSON.stringify(this.user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // 获取当前用户信息
  async getCurrentUser() {
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET'
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          return null;
        }
        throw new Error('获取用户信息失败');
      }

      const user = await response.json();
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // 用户登出
  async logout() {
    try {
      await fetch(`${API_BASE_URL}/logout`, { method: 'POST' });
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      this.user = null;
      localStorage.removeItem('user');
    }
  }

  // 检查是否已登录
  isAuthenticated() {
    return !!this.user;
  }

  // 获取当前用户
  getUser() {
    return this.user;
  }
}

// 创建单例实例
export const authService = new AuthService();
export default authService;
