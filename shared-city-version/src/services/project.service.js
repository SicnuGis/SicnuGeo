import axios from 'axios';
import { useUserStore } from '@/store/user.store';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 5000
});

// 请求拦截器，添加认证token
api.interceptors.request.use(config => {
  const userStore = useUserStore();
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`;
  }
  return config;
});

/**
 * 项目服务
 */
export const useProjectService = () => {
  /**
   * 获取所有项目
   * @returns {Promise<Array>} 项目列表
   */
  const getAllProjects = async () => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      console.error('获取项目列表失败:', error);
      throw error;
    }
  };

  /**
   * 获取项目详情
   * @param {string} id - 项目ID
   * @returns {Promise<Object>} 项目详情
   */
  const getProjectById = async (id) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`获取项目 ${id} 详情失败:`, error);
      throw error;
    }
  };

  /**
   * 创建项目
   * @param {Object} projectData - 项目数据
   * @returns {Promise<Object>} 创建的项目
   */
  const createProject = async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('创建项目失败:', error);
      throw error;
    }
  };

  /**
   * 更新项目
   * @param {string} id - 项目ID
   * @param {Object} projectData - 项目数据
   * @returns {Promise<Object>} 更新后的项目
   */
  const updateProject = async (id, projectData) => {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error(`更新项目 ${id} 失败:`, error);
      throw error;
    }
  };

  /**
   * 删除项目
   * @param {string} id - 项目ID
   * @returns {Promise<void>}
   */
  const deleteProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      console.error(`删除项目 ${id} 失败:`, error);
      throw error;
    }
  };

  /**
   * 获取项目阶段
   * @param {string} projectId - 项目ID
   * @returns {Promise<Array>} 项目阶段列表
   */
  const getProjectPhases = async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/phases`);
      return response.data;
    } catch (error) {
      console.error(`获取项目 ${projectId} 阶段失败:`, error);
      throw error;
    }
  };

  /**
   * 订阅项目
   * @param {string} projectId - 项目ID
   * @returns {Promise<void>}
   */
  const subscribeProject = async (projectId) => {
    try {
      await api.post(`/projects/${projectId}/subscribe`);
    } catch (error) {
      console.error(`订阅项目 ${projectId} 失败:`, error);
      throw error;
    }
  };

  /**
   * 取消订阅项目
   * @param {string} projectId - 项目ID
   * @returns {Promise<void>}
   */
  const unsubscribeProject = async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}/subscribe`);
    } catch (error) {
      console.error(`取消订阅项目 ${projectId} 失败:`, error);
      throw error;
    }
  };

  return {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    getProjectPhases,
    subscribeProject,
    unsubscribeProject
  };
};

export default useProjectService;