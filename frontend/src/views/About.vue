<template>
  <div class="about-container">
    <div class="about-header">
      <h1>关于共享城市版本应用</h1>
    </div>

    <div class="about-content">
      <div class="about-section">
        <h2>应用介绍</h2>
        <p>共享城市版本应用是一个智能城市项目管理与可视化平台，旨在帮助城市规划者、管理者和相关人员更好地管理和监控城市建设项目。</p>
        <p>通过本平台，用户可以直观地查看项目进度、地理分布、时间线等关键信息，实现高效的项目管理和决策支持。</p>
      </div>

      <div class="about-section">
        <h2>核心功能</h2>
        <ul>
          <li><span class="feature-icon">📊</span> 项目甘特图：直观展示项目进度和时间线</li>
          <li><span class="feature-icon">🗺️</span> GIS可视化：结合Esri API实现地理信息可视化</li>
          <li><span class="feature-icon">🔔</span> 项目订阅：及时获取项目最新进展和变更通知</li>
          <li><span class="feature-icon">👥</span> 团队协作：支持多用户协同管理项目</li>
          <li><span class="feature-icon">📈</span> 数据分析：提供项目数据统计和分析功能</li>
        </ul>
      </div>

      <div class="about-section">
        <h2>技术架构</h2>
        <div class="tech-stack">
          <div class="tech-item">Vue.js</div>
          <div class="tech-item">Vuex</div>
          <div class="tech-item">Vue Router</div>
          <div class="tech-item">Element UI</div>
          <div class="tech-item">ECharts</div>
          <div class="tech-item">Cesium</div>
          <div class="tech-item">Axios</div>
        </div>
      </div>

      <div class="about-section">
        <h2>联系我们</h2>
        <p>如果您有任何问题或建议，欢迎联系我们：</p>
        <ul class="contact-info">
          <li>邮箱：xxx</li>
          <li>电话：xxx</li>
          <li>地址：xxx</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {
      // 组件数据
    }
  },
  created() {
    // 组件创建时的逻辑
  },
  methods: {
    // 组件方法
  }
}
</script>

<style scoped>
.about-container {
  padding: 20px;
}

.about-header {
  text-align: center;
  padding: 40px 0;
  background-color: #f0f7ff;
  border-radius: 8px;
  margin-bottom: 30px;
}

.about-content {
  max-width: 1000px;
  margin: 0 auto;
}

.about-section {
  margin-bottom: 40px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.about-section h2 {
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.about-section p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
}

.about-section ul {
  list-style: none;
  padding-left: 0;
}

.about-section li {
  color: #666;
  margin-bottom: 10px;
  padding-left: 25px;
  position: relative;
}

.feature-icon {
  font-size: 1.2rem;
  margin-right: 10px;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.tech-item {
  padding: 8px 16px;
  background-color: #f0f7ff;
  border-radius: 4px;
  color: #4096ff;
}

.contact-info li {
  padding-left: 0;
}
</style>