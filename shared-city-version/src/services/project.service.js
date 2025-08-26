import axios from 'axios';
import { useUserStore } from '@/store/index';
import { getActivePinia } from 'pinia'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 5000
});

// 请求拦截器，添加认证token
api.interceptors.request.use(config => {
  try {
    // 仅当 Pinia 已激活时才访问 store，避免在模块初始化阶段报错
    if (getActivePinia && getActivePinia()) {
      const userStore = useUserStore();
      const token = userStore.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // 忽略 token 注入失败，保持请求继续
  }
  return config;
});

/**
 * 导出useProjectService函数，用于在组件中使用项目服务
 */
export const useProjectService = () => {
  return projectService;
};

/**
 * 项目服务
 */
export const projectService = {
  /**
   * 获取所有项目
   * @param {Object} params - 查询参数
   * @param {string} params.category - 项目分类
   * @param {string} params.status - 项目状态
   * @param {string} params.keyword - 搜索关键词
   * @returns {Promise<Array>} 项目列表
   */
  getAllProjects: async (params = {}) => {
    try {
      const response = await api.get('/projects', { params });
      return response.data;
    } catch (error) {
      console.error('获取项目列表失败:', error);
      throw error;
    }
  },

  /**
   * 按分类获取项目
   * @param {string} category - 项目分类
   * @returns {Promise<Array>} 项目列表
   */
  getProjectsByCategory: async (category) => {
    try {
      const response = await api.get('/projects', { params: { category } });
      return response.data;
    } catch (error) {
      console.error('按分类获取项目失败:', error);
      throw error;
    }
  },

  /**
   * 搜索项目
   * @param {string} keyword - 搜索关键词
   * @param {string} category - 项目分类（可选）
   * @returns {Promise<Array>} 项目列表
   */
  searchProjects: async (keyword, category = null) => {
    try {
      const params = { keyword };
      if (category) params.category = category;
      const response = await api.get('/projects', { params });
      return response.data;
    } catch (error) {
      console.error('搜索项目失败:', error);
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
  },

  /**
   * 保存/替换项目要素（GeoJSON FeatureCollection）
   */
  saveProjectFeatures: async (projectId, featureCollection) => {
    try {
      const response = await api.post(`/projects/${projectId}/features`, featureCollection)
      return response.data
    } catch (error) {
      console.error(`保存项目 ${projectId} 要素失败:`, error)
      throw error
    }
  },

  /**
   * 获取项目要素
   */
  getProjectFeatures: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/features`)
      return response.data
    } catch (error) {
      console.error(`获取项目 ${projectId} 要素失败:`, error)
      throw error
    }
  },

  /** 评论相关 **/
  getProjectComments: async (projectId) => {
    try {
      const resp = await api.get(`/projects/${projectId}/comments`)
      return resp.data
    } catch (e) { console.error('获取评论失败', e); throw e }
  },
  addProjectComment: async (projectId, payload) => {
    try {
      const resp = await api.post(`/projects/${projectId}/comments`, payload)
      return resp.data
    } catch (e) { console.error('添加评论失败', e); throw e }
  },

  /**
   * 获取项目地理数据
   * @returns {Promise<Object>} GeoJSON格式的项目数据
   */
  getProjectsGeoData: async () => {
    try {
      const response = await api.get('/projects/geodata');
      return response.data;
    } catch (error) {
      console.error('获取项目地理数据失败:', error);
      // 返回模拟数据作为后备
      return {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              id: 1,
              name: '智慧交通系统',
              category: 'SMART_CITY',
              status: 'inProgress',
              investment: 5000,
              startDate: '2024-01-15',
              endDate: '2024-12-31',
              description: '建设智能交通管理系统，提升城市交通效率',
              manager: '张三'
            },
            geometry: {
              type: 'Point',
              coordinates: [113.2644, 23.1291]
            }
          },
          {
            type: 'Feature',
            properties: {
              id: 2,
              name: '绿色能源项目',
              category: 'ENVIRONMENTAL',
              status: 'notStarted',
              investment: 8000,
              startDate: '2024-03-01',
              endDate: '2025-02-28',
              description: '太阳能发电站建设项目',
              manager: '李四'
            },
            geometry: {
              type: 'Point',
              coordinates: [113.2794, 23.1391]
            }
          },
          {
            type: 'Feature',
            properties: {
              id: 3,
              name: '城市供水改造',
              category: 'WATER_SUPPLY_DRAINAGE',
              status: 'completed',
              investment: 12000,
              startDate: '2023-06-01',
              endDate: '2024-01-31',
              description: '城市供水管网改造升级项目',
              manager: '王五'
            },
            geometry: {
              type: 'Point',
              coordinates: [113.2544, 23.1191]
            }
          },
          {
            type: 'Feature',
            properties: {
              id: 4,
              name: '公共安全监控',
              category: 'PUBLIC_FACILITIES',
              status: 'inProgress',
              investment: 15000,
              startDate: '2024-02-01',
              endDate: '2025-01-31',
              description: '城市公共安全监控系统建设',
              manager: '赵六'
            },
            geometry: {
              type: 'Point',
              coordinates: [113.2744, 23.1491]
            }
          },
          {
            type: 'Feature',
            properties: {
              id: 5,
              name: '地铁交通建设',
              category: 'TRANSPORTATION',
              status: 'notStarted',
              investment: 20000,
              startDate: '2024-06-01',
              endDate: '2025-12-31',
              description: '城市地铁线路建设项目',
              manager: '孙七'
            },
            geometry: {
              type: 'Point',
              coordinates: [113.2444, 23.1091]
            }
          },
          {
            type: 'Feature',
            properties: {
              id: 6,
              name: '市政道路维护',
              category: 'MUNICIPAL',
              status: 'inProgress',
              investment: 3000,
              startDate: '2024-01-01',
              endDate: '2024-06-30',
              description: '城市主要道路维护和改造',
              manager: '周八'
            },
            geometry: {
              type: 'Point',
              coordinates: [113.2344, 23.1591]
            }
          },
          {
            type: 'Feature',
            properties: {
              id: 7,
              name: '水利工程建设',
              category: 'HYDRAULIC',
              status: 'delayed',
              investment: 7500,
              startDate: '2023-09-01',
              endDate: '2024-08-31',
              description: '城市防洪排涝水利工程',
              manager: '吴九'
            },
            geometry: {
              type: 'Point',
              coordinates: [113.2844, 23.1191]
            }
          }
        ]
      };
    }
  },

  /**
   * 根据空间范围查询项目
   * @param {Object} geometry 查询几何范围
   * @param {string} geometryType 几何类型 (point, polygon, etc.)
   * @returns {Promise<Array>} 符合条件的项目列表
   */
  spatialQueryProjects: async (geometry, geometryType = 'polygon') => {
    try {
      const response = await api.post('/projects/spatial-query', {
        geometry,
        geometryType
      });
      return response.data;
    } catch (error) {
      console.error('空间查询项目失败:', error);
      throw error;
    }
  },

  /**
   * 缓冲区分析
   * @param {Object} centerPoint 中心点坐标
   * @param {number} distance 缓冲距离（米）
   * @returns {Promise<Object>} 分析结果
   */
  bufferAnalysis: async (centerPoint, distance) => {
    try {
      const response = await api.post('/projects/buffer-analysis', {
        centerPoint,
        distance
      });
      return response.data;
    } catch (error) {
      console.error('缓冲区分析失败:', error);
      throw error;
    }
  },

  /**
   * 获取项目统计数据
   * @param {Object} filters 过滤条件
   * @returns {Promise<Object>} 统计数据
   */
  getProjectStatistics: async (filters = {}) => {
    try {
      const response = await api.get('/projects/statistics', { params: filters });
      return response.data;
    } catch (error) {
      console.error('获取项目统计数据失败:', error);
      // 返回模拟统计数据
      return {
        total: 5,
        byStatus: {
          planning: 2,
          ongoing: 2,
          completed: 1,
          paused: 0
        },
        byType: {
          infrastructure: 2,
          residential: 1,
          commercial: 1,
          industrial: 1,
          public: 0
        },
        totalInvestment: 60000,
        averageInvestment: 12000
      };
    }
  },

  /**
   * 获取热力图数据
   * @param {string} dataType 数据类型 (investment, density, etc.)
   * @returns {Promise<Array>} 热力图数据点
   */
  getHeatmapData: async (dataType = 'investment') => {
    try {
      const response = await api.get(`/projects/heatmap/${dataType}`);
      return response.data;
    } catch (error) {
      console.error('获取热力图数据失败:', error);
      // 返回模拟热力图数据
      return [
        { lat: 23.1291, lng: 113.2644, intensity: 0.8 },
        { lat: 23.1391, lng: 113.2794, intensity: 0.6 },
        { lat: 23.1191, lng: 113.2544, intensity: 0.9 },
        { lat: 23.1491, lng: 113.2744, intensity: 0.7 },
        { lat: 23.1091, lng: 113.2444, intensity: 0.5 }
      ];
    }
  },

  /**
   * 导出项目地理数据
   * @param {string} format 导出格式 (geojson, kml, shapefile)
   * @param {Object} filters 过滤条件
   * @returns {Promise<Blob>} 导出文件
   */
  exportProjectGeoData: async (format = 'geojson', filters = {}) => {
    try {
      const response = await api.get('/projects/export', {
        params: { format, ...filters },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('导出项目地理数据失败:', error);
      throw error;
    }
  }
};