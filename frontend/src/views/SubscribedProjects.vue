<template>
  <div class="subscribed-projects">
    <div class="page-header">
      <h1>我的订阅项目</h1>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-number">{{ subscribedProjects.length }}</span>
          <span class="stat-label">订阅项目</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ activeProjects.length }}</span>
          <span class="stat-label">进行中</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ completedProjects.length }}</span>
          <span class="stat-label">已完成</span>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索项目名称或负责人..."
          class="search-input"
        />
        <i class="search-icon">🔍</i>
      </div>
      <div class="filter-section-row">
        <div class="filter-group">
          <label class="filter-label">按状态筛选:</label>
          <div class="filter-buttons">
            <button 
              :class="['filter-btn', { active: selectedFilter === 'all' }]"
              @click="selectedFilter = 'all'"
            >
              全部 ({{ subscribedProjects.length }})
            </button>
            <button 
              :class="['filter-btn', { active: selectedFilter === '规划中' }]"
              @click="selectedFilter = '规划中'"
            >
              规划中 ({{ getProjectsByStatus('规划中').length }})
            </button>
            <button 
              :class="['filter-btn', { active: selectedFilter === '进行中' }]"
              @click="selectedFilter = '进行中'"
            >
              进行中 ({{ getProjectsByStatus('进行中').length }})
            </button>
            <button 
              :class="['filter-btn', { active: selectedFilter === '已完成' }]"
              @click="selectedFilter = '已完成'"
            >
              已完成 ({{ getProjectsByStatus('已完成').length }})
            </button>
            <button 
              :class="['filter-btn', { active: selectedFilter === '已延期' }]"
              @click="selectedFilter = '已延期'"
            >
              已延期 ({{ getProjectsByStatus('已延期').length }})
            </button>
          </div>
        </div>
        <div class="filter-group">
          <label class="filter-label">按分类筛选:</label>
          <div class="filter-buttons">
            <button 
              :class="['filter-btn', { active: selectedCategoryFilter === 'all' }]"
              @click="selectedCategoryFilter = 'all'"
            >
              全部分类
            </button>
            <button 
              v-for="category in availableCategories"
              :key="category.value"
              :class="['filter-btn', { active: selectedCategoryFilter === category.value }]"
              @click="selectedCategoryFilter = category.value"
            >
              {{ category.label }} ({{ getProjectsByCategory(category.value).length }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目卡片列表 -->
    <div class="projects-grid">
      <div 
        v-for="project in filteredProjects" 
        :key="project.id" 
        class="project-card"
        @click="viewProjectDetail(project)"
      >
        <div class="card-header">
          <h3 class="project-title">{{ project.name }}</h3>
          <div class="card-actions">
            <button 
              class="btn-unsubscribe"
              @click.stop="unsubscribeProject(project.id)"
              title="取消订阅"
            >
              ❌
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="project-info">
            <div class="info-item">
              <span class="info-label">负责人:</span>
              <span class="info-value">{{ project.manager }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">分类:</span>
              <span v-if="project.category" :class="['category-badge', 'category-' + project.category]">
                {{ getCategoryLabel(project.category) }}
              </span>
              <span v-else class="category-badge category-default">未分类</span>
            </div>
            <div class="info-item">
              <span class="info-label">状态:</span>
              <span :class="['status-badge', 'status-' + project.status]">{{ project.status }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">开始日期:</span>
              <span class="info-value">{{ project.startDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">结束日期:</span>
              <span class="info-value">{{ project.endDate }}</span>
            </div>
          </div>
          <div class="project-description">
            <p>{{ project.description || '暂无项目描述' }}</p>
          </div>
          <div class="project-progress">
            <div class="progress-label">
              <span>项目进度</span>
              <span class="progress-percent">{{ project.progress || 0 }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: (project.progress || 0) + '%' }"
              ></div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <div class="subscription-info">
            <span class="subscription-date">订阅时间: {{ project.subscriptionDate }}</span>
          </div>
          <div class="card-buttons">
            <button class="btn-view" @click.stop="viewProjectDetail(project)">查看详情</button>
            <button class="btn-notify" @click.stop="toggleNotification(project.id)">
              {{ project.notificationEnabled ? '🔔' : '🔕' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredProjects.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>{{ searchQuery ? '未找到匹配的项目' : '暂无订阅项目' }}</h3>
      <p>{{ searchQuery ? '请尝试其他搜索关键词' : '您还没有订阅任何项目，去项目管理页面订阅感兴趣的项目吧！' }}</p>
      <button v-if="!searchQuery" class="btn-browse" @click="$router.push('/project-admin')">浏览项目</button>
    </div>

    <!-- 项目详情弹窗 -->
    <div v-if="showDetail" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>项目详情 - {{ selectedProject?.name }}</h2>
          <button class="btn-close" @click="showDetail = false">关闭</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedProject" class="project-detail">
            <div class="detail-section">
              <h3>基本信息</h3>
              <p><strong>项目名称:</strong> {{ selectedProject.name }}</p>
              <p><strong>负责人:</strong> {{ selectedProject.manager }}</p>
              <p><strong>状态:</strong> <span :class="['status-badge', 'status-' + selectedProject.status]">{{ selectedProject.status }}</span></p>
              <p><strong>开始日期:</strong> {{ selectedProject.startDate }}</p>
              <p><strong>结束日期:</strong> {{ selectedProject.endDate }}</p>
              <p><strong>订阅时间:</strong> {{ selectedProject.subscriptionDate }}</p>
            </div>
            <div class="detail-section">
              <h3>项目描述</h3>
              <div class="rich-text">{{ selectedProject.description || '暂无项目描述' }}</div>
            </div>
            <div class="detail-section">
              <h3>项目进度</h3>
              <ProjectGantt :project-id="selectedProject.id" />
            </div>
            <div class="detail-section">
              <h3>项目评论</h3>
              <ProjectComments :project-id="selectedProject.id" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProjectGantt from '@/components/charts/ProjectGantt.vue'
import { subscriptionService } from '@/services/subscription.service'
import { getAllCategoryOptions, getCategoryLabel } from '@/services/category.service'
import ProjectComments from '@/components/ProjectComments.vue'

export default {
  name: 'SubscribedProjects',
  components: {
    ProjectGantt,
    ProjectComments
  },
  data() {
    return {
      subscribedProjects: [],
      searchQuery: '',
      selectedFilter: 'all',
      selectedCategoryFilter: 'all',
      availableCategories: [],
      showDetail: false,
      selectedProject: null,
      loading: false
    }
  },
  computed: {
    filteredProjects() {
      let projects = this.subscribedProjects
      
      // 按状态筛选
      if (this.selectedFilter !== 'all') {
        projects = projects.filter(project => project.status === this.selectedFilter)
      }
      
      // 按分类筛选
      if (this.selectedCategoryFilter !== 'all') {
        projects = projects.filter(project => project.category === this.selectedCategoryFilter)
      }
      
      // 按搜索关键词筛选
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        projects = projects.filter(project => 
          project.name.toLowerCase().includes(query) ||
          project.manager.toLowerCase().includes(query) ||
          (project.category && getCategoryLabel(project.category).toLowerCase().includes(query))
        )
      }
      
      return projects
    },
    activeProjects() {
      return this.subscribedProjects.filter(p => p.status === '进行中')
    },
    completedProjects() {
      return this.subscribedProjects.filter(p => p.status === '已完成')
    }
  },
  mounted() {
    this.loadCategories()
    this.loadSubscribedProjects()
  },
  methods: {
    loadCategories() {
      this.availableCategories = getAllCategoryOptions()
    },
    
    getCategoryLabel(categoryValue) {
      return getCategoryLabel(categoryValue)
    },
    
    getProjectsByCategory(category) {
      return this.subscribedProjects.filter(project => project.category === category)
    },
    
    async loadSubscribedProjects() {
      this.loading = true
      try {
        // 模拟订阅项目数据，实际应该从API获取
        this.subscribedProjects = [
          {
            id: 1,
            name: '智慧城市数据平台',
            manager: '张三',
            status: '进行中',
            category: 'SMART_CITY',
            startDate: '2024-01-01',
            endDate: '2024-06-30',
            description: '构建智慧城市综合数据管理平台，整合各部门数据资源，提供统一的数据服务接口。',
            progress: 65,
            subscriptionDate: '2024-01-15',
            notificationEnabled: true
          },
          {
            id: 2,
            name: '城市交通优化系统',
            manager: '李四',
            status: '规划中',
            category: 'TRANSPORTATION',
            startDate: '2024-03-01',
            endDate: '2024-09-30',
            description: '基于大数据分析的城市交通流量优化系统，提高道路通行效率。',
            progress: 25,
            subscriptionDate: '2024-02-20',
            notificationEnabled: false
          },
          {
            id: 3,
            name: '环境监测网络',
            manager: '王五',
            status: '已完成',
            category: 'ENVIRONMENTAL',
            startDate: '2023-09-01',
            endDate: '2024-01-31',
            description: '建设覆盖全市的环境监测传感器网络，实时监控空气质量、噪音等环境指标。',
            progress: 100,
            subscriptionDate: '2023-10-10',
            notificationEnabled: true
          },
          {
            id: 4,
            name: '公共安全预警系统',
            manager: '赵六',
            status: '已延期',
            category: 'PUBLIC_FACILITIES',
            startDate: '2023-12-01',
            endDate: '2024-05-31',
            description: '集成视频监控、人员识别、异常行为检测的公共安全预警系统。',
            progress: 40,
            subscriptionDate: '2024-01-05',
            notificationEnabled: true
          },
          {
            id: 5,
            name: '城市供水管网改造',
            manager: '陈七',
            status: '进行中',
            category: 'WATER_SUPPLY_DRAINAGE',
            startDate: '2024-02-01',
            endDate: '2024-08-31',
            description: '对老旧供水管网进行全面改造升级，提高供水质量和安全性。',
            progress: 45,
            subscriptionDate: '2024-02-15',
            notificationEnabled: true
          }
        ]
      } catch (error) {
        console.error('加载订阅项目失败:', error)
      } finally {
        this.loading = false
      }
    },
    getProjectsByStatus(status) {
      return this.subscribedProjects.filter(project => project.status === status)
    },
    viewProjectDetail(project) {
      this.selectedProject = project
      this.showDetail = true
    },
    async unsubscribeProject(projectId) {
      if (confirm('确定要取消订阅这个项目吗？')) {
        try {
          // 实际应该调用API取消订阅
          this.subscribedProjects = this.subscribedProjects.filter(p => p.id !== projectId)
          this.$message?.success('已取消订阅')
        } catch (error) {
          console.error('取消订阅失败:', error)
          this.$message?.error('取消订阅失败')
        }
      }
    },
    async toggleNotification(projectId) {
      try {
        const project = this.subscribedProjects.find(p => p.id === projectId)
        if (project) {
          project.notificationEnabled = !project.notificationEnabled
          // 实际应该调用API更新通知设置
          this.$message?.success(project.notificationEnabled ? '已开启通知' : '已关闭通知')
        }
      } catch (error) {
        console.error('更新通知设置失败:', error)
        this.$message?.error('更新通知设置失败')
      }
    }
  }
}
</script>

<style scoped>
.subscribed-projects {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.page-header {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  margin: 0;
  color: #1f2937;
  font-size: 28px;
  font-weight: 700;
}

.header-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.filter-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.filter-section-row {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.search-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.filter-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.project-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 20px 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.project-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-unsubscribe {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.btn-unsubscribe:hover {
  background: #fee2e2;
}

.card-body {
  padding: 16px 20px;
}

.project-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #1f2937;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.status-规划中 {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.status-进行中 {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #60a5fa;
}

.status-已完成 {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #34d399;
}

.status-已延期 {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #f87171;
}

/* 分类徽章样式 */
.category-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.category-SMART_CITY {
  background: #e0e7ff;
  color: #6366F1;
}

.category-ENVIRONMENTAL {
  background: #d1fae5;
  color: #10B981;
}

.category-TRANSPORTATION {
  background: #fef3c7;
  color: #F59E0B;
}

.category-RESIDENTIAL {
  background: #f3e8ff;
  color: #8B5CF6;
}

.category-COMMERCIAL {
  background: #fed7aa;
  color: #F97316;
}

.category-INDUSTRIAL {
  background: #f3f4f6;
  color: #6B7280;
}

.category-GREEN_SPACE {
  background: #dcfce7;
  color: #22C55E;
}

.category-EDUCATION {
  background: #dbeafe;
  color: #3B82F6;
}

.category-HEALTHCARE {
  background: #fecaca;
  color: #EF4444;
}

.category-RESIDENTIAL_DEVELOPMENT {
  background: #f3e8ff;
  color: #A855F7;
}

.category-WATER_SUPPLY_DRAINAGE {
  background: #dbeafe;
  color: #2196F3;
}

.category-ROAD_TRAFFIC {
  background: #fed7aa;
  color: #FF9800;
}

.category-MUNICIPAL_UTILITIES {
  background: #dcfce7;
  color: #4CAF50;
}

.category-ENVIRONMENTAL_SANITATION {
  background: #dcfce7;
  color: #8BC34A;
}

.category-LANDSCAPE_GREENING {
  background: #dcfce7;
  color: #4CAF50;
}

.category-PUBLIC_FACILITIES {
  background: #f3e8ff;
  color: #9C27B0;
}

.category-WATER_CONSERVANCY {
  background: #cffafe;
  color: #00BCD4;
}

.category-default {
  background: #f3f4f6;
  color: #6b7280;
}

.project-description {
  margin-bottom: 16px;
}

.project-description p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-progress {
  margin-bottom: 16px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label span:first-child {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.progress-percent {
  font-size: 14px;
  color: #3b82f6;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.card-footer {
  padding: 16px 20px 20px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subscription-date {
  font-size: 12px;
  color: #9ca3af;
}

.card-buttons {
  display: flex;
  gap: 8px;
}

.btn-view {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-view:hover {
  background: #2563eb;
}

.btn-notify {
  padding: 6px 8px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-notify:hover {
  background: #e5e7eb;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px;
  color: #1f2937;
  font-size: 20px;
}

.empty-state p {
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 16px;
}

.btn-browse {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-browse:hover {
  background: #2563eb;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 90vw;
  max-height: 90vh;
  width: 800px;
  overflow: hidden;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
}

.btn-close {
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-close:hover {
  background: #e5e7eb;
}

.modal-body {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.project-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
}

.detail-section h3 {
  margin: 0 0 16px;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}

.detail-section p {
  margin: 0 0 8px;
  color: #374151;
  line-height: 1.5;
}

.rich-text {
  color: #374151;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .subscribed-projects {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }
  
  .header-stats {
    width: 100%;
    justify-content: space-around;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-box {
    max-width: none;
  }
  
  .filter-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .project-info {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 95vw;
    margin: 20px;
  }
}
</style>