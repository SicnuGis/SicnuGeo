<template>
  <div id="app">
    <!-- 导航栏 -->
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item index="home">首页</el-menu-item>
      <el-menu-item index="projects">项目管理</el-menu-item>
      <el-menu-item index="about">关于我们</el-menu-item>
      <el-menu-item index="login">登录</el-menu-item>
    </el-menu>

    <!-- 路由出口 -->
    <div class="container">
      <router-view></router-view>
    </div>

    <!-- 页脚 -->
    <footer>
      <p>© 2023 共享城市版本应用. 保留所有权利.</p>
    </footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  data() {
    return {
      activeIndex: 'home'//默认激活的菜单项
    }
  },
  computed: {
    ...mapGetters(['getAllProjects'])//从vuex获取所有项目
  },
  created() {
    // 根据当前路由设置激活的菜单项
    this.updateActiveMenu()
    // 监听路由变化
    this.$router.afterEach(() => {
      this.updateActiveMenu()
    })
  },
  methods: {
    handleSelect(key) {
      this.activeIndex = key
      // 根据选择的菜单项跳转路由
      switch(key) {
        case 'home':
          this.$router.push('/')
          break
        case 'projects':
          this.$router.push('/projects')
          break
        case 'about':
          this.$router.push('/about')
          break
        case 'login':
          this.$router.push('/login')
          break
      }
    },
    updateActiveMenu() {
      const path = this.$route.path
      if (path === '/') {
        this.activeIndex = 'home'
      } else if (path === '/projects' || path.startsWith('/projects/')) {
        this.activeIndex = 'projects'
      } else if (path === '/about') {
        this.activeIndex = 'about'
      } else if (path === '/login') {
        this.activeIndex = 'login'
      }
    }
  }
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container {
  flex: 1;
  padding: 20px;
}

footer {
  text-align: center;
  padding: 20px;
  background-color: #f5f5f5;
  border-top: 1px solid #eee;
}
</style>
