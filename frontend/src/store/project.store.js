// 项目存储 - 使用 Pinia 实现
import { defineStore } from 'pinia';

// 创建 Pinia store
export const useProjectStore = defineStore('project', {
  // 状态定义
  state: () => ({
    projects: [
      {
        id: 1,
        name: '智慧城市建设项目',
        description: '城市基础设施智能化改造项目',
        status: 'inProgress',
        startDate: '2023-01-15',
        endDate: '2023-12-31',
        createdAt: '2023-01-01',
        centerLng: 104.0668,
        centerLat: 30.5728,
        category: 'PUBLIC_FACILITIES',
        manager: '张三'
      },
      {
        id: 2,
        name: '公共交通优化工程',
        description: '城市公共交通系统升级与优化',
        status: 'inProgress',
        startDate: '2023-03-01',
        endDate: '2023-10-31',
        createdAt: '2023-02-15',
        centerLng: 104.1,
        centerLat: 30.6,
        category: 'ROAD_TRAFFIC',
        manager: '李四'
      },
      {
        id: 3,
        name: '城市绿化提升计划',
        description: '城市公园和绿化带建设项目',
        status: 'completed',
        startDate: '2023-02-01',
        endDate: '2023-06-30',
        createdAt: '2023-01-20',
        centerLng: 104.05,
        centerLat: 30.55,
        category: 'LANDSCAPE_GREENING',
        manager: '王五'
      }
    ],
    selectedProject: null,
    subscribedProjects: [1, 2, 3]
  }),

  // 获取器 - 用于派生状态
    getters: {
    // 获取所有项目
    getAllProjects: (state) => state.projects,

    // 获取选中的项目
    getSelectedProject: (state) => state.selectedProject,

    // 根据 ID 获取项目
    getProjectById: (state) => (id) => {
      return state.projects.find(project => project.id === id);
    },

    // 检查是否订阅了项目
    isSubscribed: (state) => (projectId) => {
      return state.subscribedProjects.includes(projectId);
    },

    // 获取订阅的项目列表
    getSubscribedProjects: (state) => {
      return state.projects.filter(project => state.subscribedProjects.includes(project.id));
    }
  },

  // 动作 - 用于修改状态
    actions: {
    // 设置所有项目
    setProjects(projects) {
      if (!Array.isArray(projects)) {
        console.error('Invalid projects data: Must be an array');
        return;
      }
      this.projects = projects;
    },

    // 添加项目
    addProject(project) {
      if (!project || !project.id) {
        console.error('Invalid project: Missing required fields');
        return;
      }
      // 检查项目是否已存在
      if (this.projects.some(p => p.id === project.id)) {
        console.warn(`Project with ID ${project.id} already exists`);
        return;
      }
      this.projects.push(project);
    },

    // 批量设置项目
    setProjects(projects) {
      if (!Array.isArray(projects)) {
        console.error('Invalid projects data: Must be an array');
        return;
      }
      this.projects = projects;
    },

    // 根据 ID 更新项目
    updateProjectById(id, updatedData) {
      if (!id || !updatedData) {
        console.error('Invalid parameters: ID and updatedData are required');
        return false;
      }
      const index = this.projects.findIndex(project => project.id === id);
      if (index !== -1) {
        this.projects[index] = { ...this.projects[index], ...updatedData };
        return true;
      }
      console.warn(`Project with ID ${id} not found`);
      return false;
    },

    // 根据 ID 删除项目
    deleteProjectById(id) {
      if (!id) {
        console.error('Invalid parameter: ID is required');
        return false;
      }
      const initialLength = this.projects.length;
      this.projects = this.projects.filter(project => project.id !== id);
      // 如果删除的是选中的项目，则清空选中项目
      if (this.selectedProject && this.selectedProject.id === id) {
        this.selectedProject = null;
      }
      // 从订阅列表中移除
      this.subscribedProjects = this.subscribedProjects.filter(projectId => projectId !== id);
      return this.projects.length < initialLength;
    },

    // 设置选中的项目
    setSelectedProject(project) {
      this.selectedProject = project;
    },

    // 订阅项目
    subscribeProject(projectId) {
      if (!projectId) {
        console.error('Invalid parameter: projectId is required');
        return false;
      }
      // 检查项目是否存在
      if (!this.projects.some(p => p.id === projectId)) {
        console.warn(`Cannot subscribe to non-existent project with ID ${projectId}`);
        return false;
      }
      if (!this.subscribedProjects.includes(projectId)) {
        this.subscribedProjects.push(projectId);
        return true;
      }
      return false;
    },

    // 取消订阅项目
    unsubscribeProject(projectId) {
      if (!projectId) {
        console.error('Invalid parameter: projectId is required');
        return false;
      }
      const initialLength = this.subscribedProjects.length;
      this.subscribedProjects = this.subscribedProjects.filter(id => id !== projectId);
      return this.subscribedProjects.length < initialLength;
    }
  }
});