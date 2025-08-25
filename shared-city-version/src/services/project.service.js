import axios from 'axios';
import { useUserStore } from '@/store/index';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 5000
});

// 请求拦截器，添加认证token
api.interceptors.request.use(config => {
  // 在请求拦截器中使用Pinia store
  // 注意：这里需要使用函数包装，因为拦截器是在应用初始化时创建的
  const userStore = useUserStore();
  const token = userStore.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 项目服务
 */
export const projectService = {
  /**
   * 获取所有项目
   * @returns {Promise<Array>} 项目列表
   */
  getAllProjects: async () => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      console.error('获取项目列表失败:', error);
      throw error;
    }
  },

  /**
   * 获取项目详情
   * @param {string} id - 项目ID
   * @returns {Promise<Object>} 项目详情
   */
  getProjectById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`获取项目 ${id} 详情失败:`, error);
      throw error;
    }
  },

  /**
   * 创建项目
   * @param {Object} projectData - 项目数据
   * @returns {Promise<Object>} 创建的项目
6   */
  createProject: async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('创建项目失败:', error);
      throw error;
    }
  },

  /**
   * 更新项目
   * @param {string} id - 项目ID
   * @param {Object} projectData - 项目数据
   * @returns {Promise<Object>} 更新后的项目
   */
  updateProject: async (id, projectData) => {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error(`更新项目 ${id} 失败:`, error);
      throw error;
    }
  },

  /**
   * 删除项目
   * @param {string} id - 项目ID
   * @returns {Promise<void>}
   */
  deleteProject: async (id) => {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      console.error(`删除项目 ${id} 失败:`, error);
      throw error;
    }
  },

  /**
   * 获取项目阶段
   * @param {string} projectId - 项目ID
   * @returns {Promise<Array>} 项目阶段列表
   */
  getProjectPhases: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/phases`);
      return response.data;
    } catch (error) {
      console.error(`获取项目 ${projectId} 阶段失败:`, error);
      throw error;
    }
  },

  /**
   * 订阅项目
   * @param {string} projectId - 项目ID
   * @returns {Promise<void>}
   */
  subscribeProject: async (projectId) => {
    try {
      await api.post(`/projects/${projectId}/subscribe`);
    } catch (error) {
      console.error(`订阅项目 ${projectId} 失败:`, error);
      throw error;
    }
  },

  /**
   * 取消订阅项目
   * @param {string} projectId - 项目ID
   * @returns {Promise<void>}
   */
  unsubscribeProject: async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}/subscribe`);
    } catch (error) {
      console.error(`取消订阅项目 ${projectId} 失败:`, error);
      throw error;
    }
  }
};