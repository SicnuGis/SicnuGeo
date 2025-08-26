// 用户认证服务
const API_BASE_URL = 'http://localhost:8080/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  // 用户登录
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '登录失败');
      }

      const data = await response.json();
      
      // 保存token和用户信息
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // 用户注册
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '注册失败');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // 获取当前用户信息
  async getCurrentUser() {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token过期，清除本地存储
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

  // 更新用户信息
  async updateUser(userData) {
    if (!this.token) {
      throw new Error('未登录');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '更新用户信息失败');
      }

      const updatedUser = await response.json();
      this.user = updatedUser;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  // 用户登出
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // 检查是否已登录
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // 获取当前用户
  getUser() {
    return this.user;
  }

  // 获取token
  getToken() {
    return this.token;
  }

  // 检查用户类型
  isGovernment() {
    return this.user?.userType === 'government';
  }

  // 获取用户头像URL
  getAvatarUrl() {
    if (this.user?.avatar) {
      return this.user.avatar;
    }
    // 默认头像
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user?.nickname || 'User')}&background=random&color=fff&size=40`;
  }

  // Mock数据 - 用于开发测试
  async mockLogin(credentials) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUsers = [
      {
        id: 1,
        username: 'admin',
        password: '123456',
        nickname: '管理员',
        email: 'admin@example.com',
        userType: 'government',
        avatar: null
      },
      {
        id: 2,
        username: 'user',
        password: '123456',
        nickname: '普通用户',
        email: 'user@example.com',
        userType: 'citizen',
        avatar: null
      }
    ];

    const user = mockUsers.find(u => 
      u.username === credentials.username && u.password === credentials.password
    );

    if (!user) {
      throw new Error('用户名或密码错误');
    }

    const token = 'mock-token-' + Date.now();
    const userData = { ...user };
    delete userData.password;

    // 保存token和用户信息
    this.token = token;
    this.user = userData;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    return { token, user: userData };
  }

  // Mock注册
  async mockRegister(userData) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 简单验证
    if (!userData.username || !userData.password || !userData.email) {
      throw new Error('请填写完整信息');
    }

    if (userData.password.length < 6) {
      throw new Error('密码长度至少6位');
    }

    // 模拟用户已存在检查
    if (userData.username === 'admin' || userData.username === 'user') {
      throw new Error('用户名已存在');
    }

    const newUser = {
      id: Date.now(),
      username: userData.username,
      nickname: userData.nickname || userData.username,
      email: userData.email,
      userType: userData.userType || 'citizen',
      avatar: null
    };

    return { message: '注册成功', user: newUser };
  }
}

// 创建单例实例
export const authService = new AuthService();
export default authService;
