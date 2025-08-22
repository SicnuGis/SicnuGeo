// 项目存储类，用于管理项目相关状态
class ProjectStore {
    constructor() {
        // 初始化项目数据
        this.projects = [];
        this.selectedProject = null;
        this.subscribedProjects = [];
    }

    // 添加项目
    addProject(project) {
        this.projects.push(project);
    }

    // 批量设置项目
    setProjects(projects) {
        this.projects = projects;
    }

    // 根据 ID 获取项目
    getProjectById(id) {
        return this.projects.find(project => project.id === id);
    }

    // 获取所有项目
    getAllProjects() {
        return this.projects;
    }

    // 根据 ID 更新项目
    updateProjectById(id, updatedData) {
        const index = this.projects.findIndex(project => project.id === id);
        if (index !== -1) {
            this.projects[index] = { ...this.projects[index], ...updatedData };
            return true;
        }
        return false;
    }

    // 根据 ID 删除项目
    deleteProjectById(id) {
        this.projects = this.projects.filter(project => project.id !== id);
        // 如果删除的是选中的项目，则清空选中项目
        if (this.selectedProject && this.selectedProject.id === id) {
            this.selectedProject = null;
        }
        // 从订阅列表中移除
        this.subscribedProjects = this.subscribedProjects.filter(id => id !== id);
    }

    // 设置选中的项目
    setSelectedProject(project) {
        this.selectedProject = project;
    }

    // 获取选中的项目
    getSelectedProject() {
        return this.selectedProject;
    }

    // 订阅项目
    subscribeProject(projectId) {
        if (!this.subscribedProjects.includes(projectId)) {
            this.subscribedProjects.push(projectId);
        }
    }

    // 取消订阅项目
    unsubscribeProject(projectId) {
        this.subscribedProjects = this.subscribedProjects.filter(id => id !== projectId);
    }

    // 检查是否订阅了项目
    isSubscribed(projectId) {
        return this.subscribedProjects.includes(projectId);
    }

    // 获取订阅的项目列表
    getSubscribedProjects() {
        return this.projects.filter(project => this.subscribedProjects.includes(project.id));
    }
}

// 导出 ProjectStore 类
export default ProjectStore;