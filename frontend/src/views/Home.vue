<template>
  <div class="home-container">
    <div class="hero">
      <h1>共享城市版本应用</h1>
      <p>智能城市项目管理与可视化平台</p>
      <button class="btn-primary" @click="goToProjectAdmin">进入项目管理</button>
    </div>

    <div class="features">
      <div class="feature-item" @click="$router.push('/ai-chat')" style="cursor: pointer;">
        <div class="feature-icon">🤖</div>
        <h3>AI 智能助手</h3>
        <p>与AI对话，获取城市规划建议和项目管理支持</p>
      </div>
      <div class="feature-item">
        <div class="feature-icon">📊</div>
        <h3>项目甘特图</h3>
        <p>直观展示项目进度和时间线，帮助您更好地管理项目</p>
      </div>
      <div class="feature-item">
        <div class="feature-icon">🗺️</div>
        <h3>GIS可视化</h3>
        <p>结合Cesium实现地理信息可视化，直观展示城市项目分布</p>
      </div>
      <div class="feature-item">
        <div class="feature-icon">🔔</div>
        <h3>项目订阅</h3>
        <p>订阅您关注的项目，及时获取项目最新进展和变更通知</p>
      </div>
    </div>

    <div class="recent-projects" v-if="recentProjects.length > 0">
      <h2>最近项目</h2>
      <el-carousel :interval="5000" arrow="always" height="460px" indicator-position="outside" @change="onCarouselChange">
        <el-carousel-item v-for="project in recentProjects" :key="project.id">
          <div class="project-card">
            <h3>{{ project.name }}</h3>
            <p>{{ project.description }}</p>
            <div class="project-meta">
              <span>开始日期: {{ formatDate(project.startDate) }}</span>
              <span>结束日期: {{ formatDate(project.endDate) }}</span>
              <span :class="{ 'status-delayed': project.status === 'delayed' }">
                {{ getStatusText(project.status) }}
              </span>
            </div>
            <div class="map-preview" :id="`map-preview-${project.id}`">
              <div v-if="!mapInstances[project.id]" class="map-placeholder">
                <div class="placeholder-icon">🗺️</div>
                <p>地图加载中...</p>
              </div>
            </div>
            <button @click="viewProject(project.id)">查看详情</button>
          </div>
        </el-carousel-item>
      </el-carousel>
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
              <p><strong>项目分类:</strong> {{ selectedProject.categoryLabel || '未分类' }}</p>
              <p><strong>项目地址:</strong> {{ selectedProject.address || '暂无' }}</p>
              <p><strong>投资金额:</strong> {{ selectedProject.investment || '暂无' }}万元</p>
            </div>
            <div class="detail-section">
              <h3>项目描述</h3>
              <p>{{ selectedProject.description || '暂无描述' }}</p>
            </div>
            <div class="detail-section">
              <h3>时间信息</h3>
              <p><strong>创建时间:</strong> {{ formatDate(selectedProject.createdAt) }}</p>
              <p><strong>开始日期:</strong> {{ formatDate(selectedProject.startDate) }}</p>
              <p><strong>结束日期:</strong> {{ formatDate(selectedProject.endDate) }}</p>
              <p><strong>项目状态:</strong> {{ getStatusText(selectedProject.status) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { projectService } from '@/services/project.service'
import { useProjectStore } from '@/store/index'
import maplibregl from 'maplibre-gl'

export default {
  data() {
    return {
      projects: [],
      mapInstances: {},
      showDetail: false,
      selectedProject: null
    }
  },
  created() {
    // 初始化Pinia store实例
    this.projectStore = useProjectStore()
  },
  computed: {
    recentProjects() {
      const allProjects = this.projectStore.getAllProjects
      // 按创建时间降序排序，取前3个
      return [...allProjects].sort((a, b) => {
        return new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate)
      }).slice(0, 3)
    }
  },
  mounted() {
    this.loadProjects()
  },
  beforeDestroy() {
    // 销毁地图实例
    Object.values(this.mapInstances).forEach(m => m && m.remove && m.remove())
  },
  methods: {
    async loadProjects() {
      try {
        const data = await projectService.getAllProjects()
        this.projects = data
        this.projectStore.setProjects(data)
        this.$nextTick(() => {
          this.initMaps()
        })
      } catch (error) {
        console.error('加载项目列表失败:', error)
      }
    },
    normalizeCenter(p) {
      const fallback = [104.0668, 30.5728]
      const c = p && p.center
      if (Array.isArray(c) && c.length === 2 && isFinite(c[0]) && isFinite(c[1])) return c
      if (c && typeof c === 'string') {
        const parts = c.split(',').map(Number)
        if (parts.length === 2 && isFinite(parts[0]) && isFinite(parts[1])) return parts
      }
      if (p && isFinite(p.lng) && isFinite(p.lat)) return [Number(p.lng), Number(p.lat)]
      if (p && p.location && Array.isArray(p.location) && p.location.length === 2) return p.location
      return fallback
    },
    initMaps() {
      try {
        this.recentProjects.forEach(p => this.initOneMap(p))
      } catch (e) {
        console.warn('初始化地图失败:', e)
      }
    },
    initOneMap(p) {
      const id = `map-preview-${p.id}`
      const el = document.getElementById(id)
      if (!el || this.mapInstances[p.id]) return
      
      const center = this.normalizeCenter(p)
      try {
        const map = new maplibregl.Map({
          container: el,
          style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
          center,
          zoom: 12,
          attributionControl: false,
          interactive: false // 禁用交互，适合预览
        })
        
        this.mapInstances[p.id] = map
        
        map.on('load', () => {
          // 添加项目中心点标记
          map.addSource(`center-${p.id}`, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: center
                },
                properties: {
                  name: p.name
                }
              }]
            }
          })
          
          map.addLayer({
            id: `center-layer-${p.id}`,
            type: 'circle',
            source: `center-${p.id}`,
            paint: {
              'circle-radius': 8,
              'circle-color': '#4096ff',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }
          })
          
          // 如果有GeoJSON数据，也添加到地图上
          if (p.geoData && p.geoData.features && Array.isArray(p.geoData.features)) {
            map.addSource(`geojson-${p.id}`, {
              type: 'geojson',
              data: p.geoData
            })
            
            map.addLayer({
              id: `geojson-layer-${p.id}`,
              type: 'fill',
              source: `geojson-${p.id}`,
              paint: {
                'fill-color': '#4096ff',
                'fill-opacity': 0.3,
                'fill-outline-color': '#4096ff'
              }
            })
          }
        })
        
        map.on('error', (e) => {
          console.warn('地图加载错误:', e)
        })
        
      } catch (e) {
        console.warn('创建地图实例失败:', e)
        // 如果地图创建失败，显示静态图片占位符
        this.showMapFallback(el, p)
      }
    },
    onCarouselChange(activeIndex) {
      // 轮播切换后，尝试初始化当前活跃卡片的地图
      const p = this.recentProjects && this.recentProjects[activeIndex]
      if (p) this.$nextTick(() => this.initOneMap(p))
    },
    showMapFallback(el, project) {
      // 显示静态地图占位符
      el.innerHTML = `
        <div class="map-fallback">
          <div class="fallback-icon">📍</div>
          <div class="fallback-text">
            <p><strong>${project.name}</strong></p>
            <p>项目位置预览</p>
          </div>
        </div>
      `
    },
    goToProjectAdmin() {
      this.$router.push('/projects')
    },
    async viewProject(id) {
      try {
        const project = this.recentProjects.find(p => p.id === id)
        if (project) {
          this.selectedProject = project
          this.showDetail = true
        }
      } catch (error) {
        console.error('Failed to load project detail:', error)
      }
    },
    formatDate(dateString) {
      if (!dateString) return '暂无'
      const date = new Date(dateString)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    },
    getStatusText(status) {
      const statusMap = {
        notStarted: '未开始',
        inProgress: '进行中',
        completed: '已完成',
        delayed: '已延期'
      }
      return statusMap[status] || '未知状态'
    }
  }
}
</script>

<style scoped>
.home-container {
  padding: 0 20px;
}

.hero {
  text-align: center;
  padding: 60px 20px;
  background-color: #f0f7ff;
  border-radius: 8px;
  margin-bottom: 40px;
  border: 1px solid #dcdfe6; /* 清晰的分块边界 */
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: #333;
}

.hero p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 30px;
}

.btn-primary {
  padding: 12px 24px;
  background-color: #4096ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #3182ce;
}

.features {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
}

.feature-item {
  flex: 1;
  text-align: center;
  padding: 20px;
  margin: 0 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.feature-item h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.feature-item p {
  color: #666;
}

.recent-projects {
  margin-bottom: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
}

.recent-projects h2 {
  margin-bottom: 20px;
  color: #333;
}

.project-card {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 24px; /* 底部留白，避免被轮播控件/指示器覆盖 */
}

.project-card h3 {
  margin-bottom: 10px;
  color: #333;
}

.project-card p {
  color: #666;
  margin-bottom: 12px;
  flex: 0;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.map-preview {
  height: 160px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 16px;
  border: 1px solid #ebeef5;
  position: relative;
  background-color: #f5f7fa;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.placeholder-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.map-placeholder p {
  margin: 0;
  font-size: 0.9rem;
}

.map-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.fallback-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.fallback-text p {
  margin: 4px 0;
  font-size: 0.9rem;
}

.fallback-text p:first-child {
  font-weight: bold;
  font-size: 1rem;
}

.status-delayed {
  color: #ff4d4f;
}

.project-card button {
  padding: 8px 16px;
  background-color: #4096ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-start;
}

@media (max-width: 768px) {
  .features {
    flex-direction: column;
  }

  .feature-item {
    margin: 10px 0;
  }
}

:deep(.el-carousel__indicators.el-carousel__indicators--outside) {
  margin-top: 16px;
}

/* 修复轮播按钮重叠问题 */
:deep(.el-carousel__arrow) {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(31, 45, 61, 0.11);
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-carousel__arrow--left) {
  left: 16px;
}

:deep(.el-carousel__arrow--right) {
  right: 16px;
}

:deep(.el-carousel__arrow:hover) {
  background-color: rgba(31, 45, 61, 0.23);
}

:deep(.el-carousel__arrow i) {
  color: #fff;
  font-size: 12px;
}

/* 项目详情弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.btn-close {
  background: #f5f5f5;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
}

.btn-close:hover {
  background: #e8e8e8;
}

.modal-body {
  padding: 20px;
}

.project-detail {
  line-height: 1.6;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  color: #409eff;
  font-size: 16px;
  margin-bottom: 12px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 4px;
}

.detail-section p {
  margin: 8px 0;
  color: #666;
}

.detail-section strong {
  color: #333;
  font-weight: 600;
}
</style>