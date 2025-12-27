<template>
  <div class="subscribed-projects-container">
    <!-- 左侧项目列表 (从栏) -->
    <div class="projects-sidebar glass-effect">
      <div class="sidebar-header">
        <h2>我的订阅</h2>
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索项目..."
            class="search-input"
          />
        </div>
      </div>

      <div class="projects-list">
        <div 
          v-for="project in filteredProjects" 
          :key="project.id" 
          class="project-item glass-card"
          :class="{ active: selectedProject?.id === project.id }"
          @click="selectProject(project)"
        >
          <div class="project-status-dot" :class="project.status"></div>
          <div class="project-info">
            <h3>{{ project.name }}</h3>
            <p class="project-meta">
              <span>{{ getCategoryLabel(project.category) }}</span>
              <span class="separator">•</span>
              <span>{{ formatDate(project.startDate) }}</span>
            </p>
          </div>
          <button class="btn-details" @click.stop="viewProjectDetail(project)">
            详情
          </button>
        </div>
      </div>
    </div>

    <!-- 右侧地图展示 (主栏) -->
    <div class="map-container">
      <div v-if="!selectedProject" class="empty-map-state glass-effect">
        <div class="empty-content">
          <i class="icon-map">🗺️</i>
          <h3>选择一个项目查看位置</h3>
          <p>点击左侧列表中的项目以在地图上显示</p>
        </div>
      </div>
      <ProjectLocationViewer 
        v-else
        :key="selectedProject.id"
        :projects="[selectedProject]"
        :initial-center="[selectedProject.centerLng, selectedProject.centerLat]"
        class="map-viewer"
      />
    </div>

    <!-- 项目详情弹窗 -->
    <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = false">
      <div class="modal glass-effect">
        <div class="modal-header">
          <h2>{{ currentDetailProject?.name }}</h2>
          <button class="btn-close" @click="showDetail = false">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>项目状态</label>
              <span :class="['status-badge', currentDetailProject?.status]">
                {{ getStatusText(currentDetailProject?.status) }}
              </span>
            </div>
            <div class="detail-item">
              <label>负责人</label>
              <span>{{ currentDetailProject?.manager }}</span>
            </div>
            <div class="detail-item">
              <label>开始日期</label>
              <span>{{ formatDate(currentDetailProject?.startDate) }}</span>
            </div>
            <div class="detail-item">
              <label>结束日期</label>
              <span>{{ formatDate(currentDetailProject?.endDate) }}</span>
            </div>
            <div class="detail-item full-width">
              <label>项目描述</label>
              <p>{{ currentDetailProject?.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useProjectStore } from '@/store';
import ProjectLocationViewer from '@/components/gis/ProjectLocationViewer.vue';
import { ProjectCategories, getCategoryLabel } from '@/services/category.service';

export default {
  name: 'SubscribedProjects',
  components: {
    ProjectLocationViewer
  },
  data() {
    return {
      searchQuery: '',
      selectedProject: null,
      showDetail: false,
      currentDetailProject: null
    };
  },
  computed: {
    ...mapState(useProjectStore, ['getSubscribedProjects']),
    subscribedProjects() {
      return this.getSubscribedProjects || [];
    },
    filteredProjects() {
      if (!this.searchQuery) return this.subscribedProjects;
      const query = this.searchQuery.toLowerCase();
      return this.subscribedProjects.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query))
      );
    }
  },
  methods: {
    selectProject(project) {
      this.selectedProject = project;
    },
    viewProjectDetail(project) {
      this.currentDetailProject = project;
      this.showDetail = true;
    },
    formatDate(date) {
      if (!date) return '未设置';
      return new Date(date).toLocaleDateString();
    },
    getStatusText(status) {
      const map = {
        'planning': '规划中',
        'inProgress': '进行中',
        'completed': '已完成',
        'delayed': '已延期'
      };
      return map[status] || status;
    },
    getCategoryLabel(category) {
      return getCategoryLabel(category);
    }
  },
  mounted() {
    // Select first project by default if available
    if (this.subscribedProjects.length > 0) {
      this.selectProject(this.subscribedProjects[0]);
    }
  }
};
</script>

<style scoped>
.subscribed-projects-container {
  display: flex;
  height: calc(100vh - 60px); /* Adjust based on header height */
  background-color: #f0f2f5;
  overflow: hidden;
}

/* Glass Effect Utility */
.glass-effect {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

/* Sidebar Styles */
.projects-sidebar {
  width: 350px;
  display: flex;
  flex-direction: column;
  z-index: 10;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.sidebar-header h2 {
  margin: 0 0 15px 0;
  font-size: 20px;
  color: #2c3e50;
  font-weight: 600;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s;
  box-sizing: border-box; /* Ensure padding doesn't increase width */
}

.search-input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.projects-list {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.project-item {
  padding: 15px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.project-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.9);
}

.project-item.active {
  background: white;
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.project-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.project-status-dot.planning { background-color: #909399; }
.project-status-dot.inProgress { background-color: #409eff; }
.project-status-dot.completed { background-color: #67c23a; }
.project-status-dot.delayed { background-color: #f56c6c; }

.project-info {
  flex: 1;
  min-width: 0;
}

.project-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-meta {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.separator {
  margin: 0 5px;
}

.btn-details {
  padding: 4px 10px;
  font-size: 12px;
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-details:hover {
  background: #409eff;
  color: white;
}

/* Map Container Styles */
.map-container {
  flex: 1;
  position: relative;
  background-color: #eef1f6;
}

.map-viewer {
  width: 100%;
  height: 100%;
}

.empty-map-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  color: #606266;
}

.icon-map {
  font-size: 48px;
  margin-bottom: 15px;
  display: block;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 500px;
  max-width: 90%;
  border-radius: 16px;
  overflow: hidden;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #909399;
  cursor: pointer;
}

.modal-body {
  padding: 25px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item.full-width {
  grid-column: span 2;
}

.detail-item label {
  font-size: 12px;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span, .detail-item p {
  font-size: 14px;
  color: #2c3e50;
  margin: 0;
  line-height: 1.5;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
}

.status-badge.planning { background-color: #909399; }
.status-badge.inProgress { background-color: #409eff; }
.status-badge.completed { background-color: #67c23a; }
.status-badge.delayed { background-color: #f56c6c; }
</style>