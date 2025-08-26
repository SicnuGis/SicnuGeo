<template>
  <div class="project-location-viewer">
    <!-- 分类筛选器 -->
    <CategoryFilter 
      :projects="allProjects"
      :filtered-count="filteredProjects.length"
      @filter-change="onFilterChange"
    />
    
    <!-- 项目筛选控制面板 -->
    <div class="filter-panel">
      <div class="filter-group">
        <label>项目状态:</label>
        <select v-model="selectedStatus" @change="filterProjects">
          <option value="">全部状态</option>
          <option value="notStarted">未开始</option>
          <option value="inProgress">进行中</option>
          <option value="completed">已完成</option>
          <option value="delayed">延期</option>
        </select>
      </div>
      <div class="filter-group">
        <label>时间范围:</label>
        <input 
          type="date" 
          v-model="startDate" 
          @change="filterProjects"
          placeholder="开始日期"
        >
        <input 
          type="date" 
          v-model="endDate" 
          @change="filterProjects"
          placeholder="结束日期"
        >
      </div>
      <div class="filter-actions">
        <button @click="clearFilters" class="btn-clear">清除筛选</button>
        <button @click="exportData" class="btn-export">导出数据</button>
      </div>
    </div>

    <!-- 项目统计信息 -->
    <div class="stats-panel">
      <div class="stat-item">
        <div class="stat-number">{{ filteredProjects.length }}</div>
        <div class="stat-label">项目总数</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ getProjectsByStatus('ongoing').length }}</div>
        <div class="stat-label">进行中</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ getProjectsByStatus('completed').length }}</div>
        <div class="stat-label">已完成</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ calculateTotalInvestment() }}</div>
        <div class="stat-label">总投资(万元)</div>
      </div>
    </div>

    <!-- 项目列表 -->
    <div class="project-list">
      <div class="list-header">
        <h3>项目列表 ({{ filteredProjects.length }})</h3>
        <div class="view-controls">
          <button 
            :class="['btn-view', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
          >
            列表视图
          </button>
          <button 
            :class="['btn-view', { active: viewMode === 'grid' }]"
            @click="viewMode = 'grid'"
          >
            网格视图
          </button>
        </div>
      </div>
      
      <div :class="['project-items', viewMode]">
        <div 
          v-for="project in paginatedProjects" 
          :key="project.id"
          :class="['project-item', { selected: selectedProject?.id === project.id }]"
          @click="selectProject(project)"
        >
          <div class="project-header">
            <h4>{{ project.name }}</h4>
            <span :class="['status-badge', project.status]">{{ getStatusText(project.status) }}</span>
          </div>
          <div class="project-info">
            <div class="info-row">
              <span class="label">类型:</span>
              <span class="value">{{ project.categoryLabel || getCategoryLabel(project.category) }}</span>
            </div>
            <div class="info-row">
              <span class="label">负责人:</span>
              <span class="value">{{ project.manager }}</span>
            </div>
            <div class="info-row">
              <span class="label">投资:</span>
              <span class="value">{{ project.investment }}万元</span>
            </div>
            <div class="info-row">
              <span class="label">位置:</span>
              <span class="value">{{ project.address }}</span>
            </div>
          </div>
          <div class="project-actions">
            <button @click.stop="viewOnMap(project)" class="btn-map">地图定位</button>
            <button @click.stop="viewDetails(project)" class="btn-details">查看详情</button>
          </div>
        </div>
      </div>

      <!-- 分页控制 -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="btn-page"
        >
          首页
        </button>
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="btn-page"
        >
          上一页
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="btn-page"
        >
          下一页
        </button>
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages"
          class="btn-page"
        >
          末页
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { projectService } from '@/services/project.service'
import { getCategoryLabel } from '@/services/category.service'
import { categoryService } from '@/services/category.service'
import CategoryFilter from '@/components/CategoryFilter.vue'

export default {
  name: 'ProjectLocationViewer',
  components: {
    CategoryFilter
  },
  props: {
    mapView: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      allProjects: [],
      projects: [],
      filteredProjects: [],
      selectedProject: null,
      selectedStatus: '',
      startDate: '',
      endDate: '',
      viewMode: 'list',
      currentPage: 1,
      pageSize: 10,
      currentFilters: {
        keyword: '',
        categories: [],
        status: null
      }
    }
  },
  computed: {
    paginatedProjects() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredProjects.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredProjects.length / this.pageSize)
    }
  },
  async mounted() {
    await this.loadProjects()
  },
  methods: {
    async loadProjects() {
      this.loading = true
      try {
        // 使用真实的API获取项目数据
        const projects = await projectService.getAllProjects()
        this.allProjects = projects
        this.projects = projects
        this.applyFilters()
        this.$emit('projects-loaded', this.projects)
      } catch (error) {
        console.error('加载项目数据失败:', error)
        // 如果API失败，使用模拟数据
        this.allProjects = this.getMockProjects()
        this.projects = this.allProjects
        this.applyFilters()
      } finally {
        this.loading = false
      }
    },

    getMockProjects() {
      return [
        {
          id: 1,
          name: '天府新区智慧园区',
          category: 'PUBLIC_FACILITIES',
          status: 'inProgress',
          manager: '张三',
          investment: 50000,
          address: '天府新区兴隆街道',
          centerLng: 104.0668,
          centerLat: 30.5728,
          startDate: '2023-01-15',
          endDate: '2024-12-31',
          description: '建设集办公、研发、生活为一体的智慧园区'
        },
        {
          id: 2,
          name: '锦江区商业综合体',
          category: 'PUBLIC_FACILITIES',
          status: 'notStarted',
          manager: '李四',
          investment: 80000,
          address: '锦江区春熙路',
          centerLng: 104.0800,
          centerLat: 30.6600,
          startDate: '2024-03-01',
          endDate: '2026-06-30',
          description: '打造现代化商业综合体，提升区域商业活力'
        },
        {
          id: 3,
          name: '青羊区文化中心',
          category: 'LANDSCAPE_GREENING',
          status: 'completed',
          manager: '王五',
          investment: 30000,
          address: '青羊区文殊院街道',
          centerLng: 104.0500,
          centerLat: 30.6800,
          startDate: '2022-06-01',
          endDate: '2023-10-31',
          description: '建设集图书馆、博物馆、剧院为一体的文化中心'
        },
        {
          id: 4,
          name: '高新区科技孵化器',
          category: 'INDUSTRIAL_DEVELOPMENT',
          status: 'inProgress',
          manager: '赵六',
          investment: 25000,
          address: '高新区天府软件园',
          centerLng: 104.0400,
          centerLat: 30.5400,
          startDate: '2023-09-01',
          endDate: '2024-08-31',
          description: '为初创科技企业提供孵化服务和办公场所'
        },
        {
          id: 5,
          name: '武侯区住宅小区',
          category: 'RESIDENTIAL_DEVELOPMENT',
          status: 'delayed',
          manager: '孙七',
          investment: 120000,
          address: '武侯区红牌楼',
          centerLng: 104.0300,
          centerLat: 30.6200,
          startDate: '2023-05-01',
          endDate: '2025-12-31',
          description: '建设高品质住宅小区，改善居民居住条件'
        }
      ]
    },

    onFilterChange(filters) {
      this.currentFilters = filters
      this.applyFilters()
    },

    applyFilters() {
      let filtered = [...this.allProjects]
      
      // 应用关键词筛选
      if (this.currentFilters.keyword) {
        const keyword = this.currentFilters.keyword.toLowerCase()
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(keyword) ||
          p.address.toLowerCase().includes(keyword) ||
          p.manager.toLowerCase().includes(keyword) ||
          (p.category && getCategoryLabel(p.category).toLowerCase().includes(keyword))
        )
      }
      
      // 应用分类筛选
      if (this.currentFilters.categories && this.currentFilters.categories.length > 0) {
        filtered = filtered.filter(p => 
          this.currentFilters.categories.includes(p.category)
        )
      }
      
      // 应用状态筛选
      if (this.selectedStatus) {
        filtered = filtered.filter(p => p.status === this.selectedStatus)
      }
      
      // 应用时间范围筛选
      if (this.startDate) {
        filtered = filtered.filter(p => p.startDate >= this.startDate)
      }
      if (this.endDate) {
        filtered = filtered.filter(p => p.endDate <= this.endDate)
      }
      
      this.filteredProjects = filtered
      this.currentPage = 1
      
      this.$emit('projects-filtered', this.filteredProjects)
    },

    filterProjects() {
      this.applyFilters()
    },

    clearFilters() {
      this.selectedStatus = ''
      this.startDate = ''
      this.endDate = ''
      this.currentFilters = {
        keyword: '',
        categories: [],
        status: null
      }
      this.applyFilters()
    },

    selectProject(project) {
      this.selectedProject = project
      this.$emit('project-selected', project)
    },

    viewOnMap(project) {
      this.$emit('view-on-map', project)
    },

    viewDetails(project) {
      this.$emit('view-details', project)
    },

    exportData() {
      // 导出项目数据为CSV
      const csvContent = this.generateCSV(this.filteredProjects)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `项目数据_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    generateCSV(projects) {
      const headers = ['项目名称', '项目类型', '项目状态', '负责人', '投资金额', '项目地址', '开始日期', '结束日期']
      const rows = projects.map(p => [
        p.name,
        this.getTypeText(p.type),
        this.getStatusText(p.status),
        p.manager,
        p.investment,
        p.address,
        p.startDate,
        p.endDate
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    },

    getProjectsByStatus(status) {
      const statusMap = {
        'ongoing': 'inProgress',
        'completed': 'completed'
      }
      const mappedStatus = statusMap[status] || status
      return this.filteredProjects.filter(p => p.status === mappedStatus)
    },

    calculateTotalInvestment() {
      return this.filteredProjects.reduce((total, p) => total + p.investment, 0).toLocaleString()
    },

    getStatusText(status) {
      const statusMap = {
        notStarted: '未开始',
        inProgress: '进行中',
        completed: '已完成',
        delayed: '延期'
      }
      return statusMap[status] || status
    },

    getCategoryText(category) {
      return getCategoryLabel(category)
    }
  }
}
</script>

<style scoped>
.project-location-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.filter-panel {
  background: white;
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 13px;
  color: #495057;
  white-space: nowrap;
}

.filter-group select,
.filter-group input {
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
  min-width: 120px;
}

.filter-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.btn-clear,
.btn-export {
  padding: 6px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.btn-clear:hover {
  background: #e9ecef;
}

.btn-export {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.btn-export:hover {
  background: #218838;
}

.stats-panel {
  background: white;
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
}

.project-list {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
}

.list-header {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h3 {
  margin: 0;
  font-size: 16px;
  color: #495057;
}

.view-controls {
  display: flex;
  gap: 4px;
}

.btn-view {
  padding: 6px 12px;
  border: 1px solid #ced4da;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.btn-view:first-child {
  border-radius: 4px 0 0 4px;
}

.btn-view:last-child {
  border-radius: 0 4px 4px 0;
}

.btn-view.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.project-items {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.project-items.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-items.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.project-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.project-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0,123,255,0.1);
}

.project-item.selected {
  border-color: #007bff;
  background: #f8f9ff;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.project-header h4 {
  margin: 0;
  font-size: 16px;
  color: #495057;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.planning {
  background: #fff3cd;
  color: #856404;
}

.status-badge.ongoing {
  background: #d4edda;
  color: #155724;
}

.status-badge.completed {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.paused {
  background: #f8d7da;
  color: #721c24;
}

.project-info {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  margin-bottom: 4px;
}

.info-row .label {
  width: 60px;
  font-size: 13px;
  color: #6c757d;
  flex-shrink: 0;
}

.info-row .value {
  font-size: 13px;
  color: #495057;
}

.project-actions {
  display: flex;
  gap: 8px;
}

.btn-map,
.btn-details {
  padding: 6px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.btn-map {
  color: #007bff;
  border-color: #007bff;
}

.btn-map:hover {
  background: #007bff;
  color: white;
}

.btn-details {
  color: #28a745;
  border-color: #28a745;
}

.btn-details:hover {
  background: #28a745;
  color: white;
}

.pagination {
  padding: 16px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.btn-page {
  padding: 6px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
  background: #e9ecef;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: #6c757d;
  margin: 0 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-panel {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-actions {
    margin-left: 0;
    justify-content: center;
  }
  
  .stats-panel {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .project-items.grid {
    grid-template-columns: 1fr;
  }
  
  .list-header {
    flex-direction: column;
    gap: 12px;
  }
}
</style>