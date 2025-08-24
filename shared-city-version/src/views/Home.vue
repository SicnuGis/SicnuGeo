<template>
  <div class="home-container">
    <div class="hero">
      <h1>共享城市版本应用</h1>
      <p>智能城市项目管理与可视化平台</p>
      <button class="btn-primary" @click="goToProjectAdmin">进入项目管理</button>
    </div>

    <div class="features">
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

    <div class="recent-projects" v-if="projects.length > 0">
      <h2>最近项目</h2>
      <el-carousel :interval="5000" arrow="always">
        <el-carousel-item v-for="project in projects" :key="project.id">
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
            <button @click="viewProject(project.id)">查看详情</button>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>

<script>
import { projectService } from '@/services/project.service'

export default {
  data() {
    return {
      projects: []
    }
  },
  computed: {
    recentProjects() {
      const allProjects = this.$store.getters.getAllProjects()
      // 按创建时间降序排序，取前3个
      return [...allProjects].sort((a, b) => {
        return new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate)
      }).slice(0, 3)
    }
  },
  mounted() {
    this.loadProjects()
  },
  methods: {
    async loadProjects() {
      try {
        const data = await projectService.getAllProjects()
        this.projects = data
        // 更新Vuex store
        this.$store.dispatch('setProjects', data)
      } catch (error) {
        console.error('加载项目列表失败:', error)
      }
    },
    goToProjectAdmin() {
      this.$router.push('/projects')
    },
    viewProject(id) {
      this.$router.push({ name: 'ProjectDetail', params: { id } })
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
}

.project-card h3 {
  margin-bottom: 10px;
  color: #333;
}

.project-card p {
  color: #666;
  margin-bottom: 20px;
  flex: 1;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 20px;
  font-size: 0.9rem;
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
</style>