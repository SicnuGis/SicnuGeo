import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 5000
});

/**
 * 项目分类服务
 */
export const categoryService = {
  /**
   * 获取所有项目分类
   * @returns {Promise<Array>} 分类列表
   */
  getAllCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('获取分类列表失败:', error);
      throw error;
    }
  },

  /**
   * 获取分类名称列表
   * @returns {Promise<Array>} 分类名称列表
   */
  getCategoryNames: async () => {
    try {
      const response = await api.get('/categories/names');
      return response.data;
    } catch (error) {
      console.error('获取分类名称失败:', error);
      throw error;
    }
  },

  /**
   * 根据分类获取项目
   * @param {string} category - 分类名称
   * @param {string} status - 项目状态（可选）
   * @param {string} keyword - 搜索关键词（可选）
   * @returns {Promise<Array>} 项目列表
   */
  getProjectsByCategory: async (category, status = null, keyword = null) => {
    try {
      const params = { category };
      if (status) params.status = status;
      if (keyword) params.keyword = keyword;
      
      const response = await api.get('/projects', { params });
      return response.data;
    } catch (error) {
      console.error('按分类获取项目失败:', error);
      throw error;
    }
  }
};

/**
 * 项目分类常量和工具函数
 */
export const ProjectCategories = {
  WATER_SUPPLY_DRAINAGE: {
    value: 'WATER_SUPPLY_DRAINAGE',
    label: '给排水工程',
    iconType: 'water',
    color: '#2196F3',
    icon: '🚰'
  },
  ROAD_TRAFFIC: {
    value: 'ROAD_TRAFFIC',
    label: '道路交通工程',
    iconType: 'road',
    color: '#FF9800',
    icon: '🛣️'
  },
  MUNICIPAL_UTILITIES: {
    value: 'MUNICIPAL_UTILITIES',
    label: '市政公用工程',
    iconType: 'utilities',
    color: '#4CAF50',
    icon: '⚡'
  },
  ENVIRONMENTAL_SANITATION: {
    value: 'ENVIRONMENTAL_SANITATION',
    label: '环境卫生工程',
    iconType: 'environment',
    color: '#8BC34A',
    icon: '🌱'
  },
  LANDSCAPE_GREENING: {
    value: 'LANDSCAPE_GREENING',
    label: '园林绿化工程',
    iconType: 'landscape',
    color: '#4CAF50',
    icon: '🏞️'
  },
  PUBLIC_FACILITIES: {
    value: 'PUBLIC_FACILITIES',
    label: '公共设施工程',
    iconType: 'public',
    color: '#9C27B0',
    icon: '🏢'
  },
  WATER_CONSERVANCY: {
    value: 'WATER_CONSERVANCY',
    label: '水利工程',
    iconType: 'water_conservancy',
    color: '#00BCD4',
    icon: '🌊'
  },
  // 添加缺失的分类定义
  SMART_CITY: {
    value: 'SMART_CITY',
    label: '智慧城市',
    iconType: 'smart_city',
    color: '#6366F1',
    icon: '🏙️'
  },
  ENVIRONMENTAL: {
    value: 'ENVIRONMENTAL',
    label: '环境保护',
    iconType: 'environmental',
    color: '#10B981',
    icon: '🌿'
  },
  TRANSPORTATION: {
    value: 'TRANSPORTATION',
    label: '交通运输',
    iconType: 'transportation',
    color: '#F59E0B',
    icon: '🚌'
  },
  RESIDENTIAL: {
    value: 'RESIDENTIAL',
    label: '住宅建设工程',
    iconType: 'residential',
    color: '#8B5CF6',
    icon: '🏠'
  },
  COMMERCIAL: {
    value: 'COMMERCIAL',
    label: '商业开发工程',
    iconType: 'commercial',
    color: '#F97316',
    icon: '🏬'
  },
  INDUSTRIAL: {
    value: 'INDUSTRIAL',
    label: '工业园区工程',
    iconType: 'industrial',
    color: '#6B7280',
    icon: '🏭'
  },
  GREEN_SPACE: {
    value: 'GREEN_SPACE',
    label: '绿地景观工程',
    iconType: 'green_space',
    color: '#22C55E',
    icon: '🌳'
  },
  EDUCATION: {
    value: 'EDUCATION',
    label: '教育设施工程',
    iconType: 'education',
    color: '#3B82F6',
    icon: '🎓'
  },
  HEALTHCARE: {
    value: 'HEALTHCARE',
    label: '医疗设施工程',
    iconType: 'healthcare',
    color: '#EF4444',
    icon: '🏥'
  },
  RESIDENTIAL_DEVELOPMENT: {
    value: 'RESIDENTIAL_DEVELOPMENT',
    label: '住宅开发',
    iconType: 'residential_development',
    color: '#A855F7',
    icon: '🏘️'
  }
};

/**
 * 根据分类值获取分类信息
 * @param {string} categoryValue - 分类值
 * @returns {Object|null} 分类信息
 */
export const getCategoryInfo = (categoryValue) => {
  return Object.values(ProjectCategories).find(cat => cat.value === categoryValue) || null;
};

/**
 * 获取所有分类选项
 * @returns {Array} 分类选项数组
 */
export const getAllCategoryOptions = () => {
  return Object.values(ProjectCategories);
};

/**
 * 根据分类获取对应的颜色
 * @param {string} categoryValue - 分类值
 * @returns {string} 颜色值
 */
export const getCategoryColor = (categoryValue) => {
  const category = getCategoryInfo(categoryValue);
  return category ? category.color : '#666666';
};

/**
 * 根据分类获取对应的图标
 * @param {string} categoryValue - 分类值
 * @returns {string} 图标
 */
export const getCategoryIcon = (categoryValue) => {
  const category = getCategoryInfo(categoryValue);
  return category ? category.icon : '📋';
};

/**
 * 根据分类获取对应的标签名称
 * @param {string} categoryValue - 分类值
 * @returns {string} 标签名称
 */
export const getCategoryLabel = (categoryValue) => {
  const category = getCategoryInfo(categoryValue);
  return category ? category.label : categoryValue;
};