// 用户存储 - 使用 Pinia 实现
import { defineStore } from 'pinia';

// 创建 Pinia store
export const useUserStore = defineStore('user', {
  // 状态定义
  state: () => ({
    users: [],
    token: null,
    currentUser: null
  }),

  // 获取器
  getters: {
    getAllUsers: (state) => state.users,
    getCurrentUser: (state) => state.currentUser,
    isAuthenticated: (state) => !!state.token
  },

  // 动作
  actions: {
    // 添加用户
    addUser(user) {
      if (!user || !user.id) {
        console.error('Invalid user: Missing required fields');
        return;
      }
      if (this.users.some(u => u.id === user.id)) {
        console.warn(`User with ID ${user.id} already exists`);
        return;
      }
      this.users.push(user);
    },

    // 根据 ID 获取用户
    getUserById(id) {
      return this.users.find(user => user.id === id);
    },

    // 根据 ID 删除用户
    deleteUserById(id) {
      if (!id) {
        console.error('Invalid parameter: ID is required');
        return false;
      }
      const initialLength = this.users.length;
      this.users = this.users.filter(user => user.id !== id);
      return this.users.length < initialLength;
    },

    // 设置当前用户
    setCurrentUser(user) {
      this.currentUser = user;
    },

    // 设置认证令牌
    setToken(token) {
      this.token = token;
    },

    // 清除认证信息
    clearAuth() {
      this.token = null;
      this.currentUser = null;
    }
  }
});
