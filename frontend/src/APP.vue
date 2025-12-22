<template>
  <div id="app">
    <!-- 导航栏 -->
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item index="home">首页</el-menu-item>
      <el-menu-item index="ai-chat">AI 助手</el-menu-item>
      <el-menu-item index="projects">项目管理</el-menu-item>
      <el-menu-item index="subscribed-projects">订阅项目</el-menu-item>
      <el-menu-item index="about">关于我们</el-menu-item>
      <!-- 用户状态组件 -->
      <div class="user-status-wrapper">
        <UserStatus 
          @login-success="handleLoginSuccess"
          @logout="handleLogout"
          @user-updated="handleUserUpdated"
        />
      </div>
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
import UserStatus from '@/components/UserStatus.vue'

export default {
  name: 'App',
  components: {
    UserStatus
  },
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
        case 'ai-chat':
          this.$router.push('/ai-chat')
          break
        case 'projects':
          this.$router.push('/projects')
          break
        case 'subscribed-projects':
          this.$router.push('/subscribed-projects')
          break
        case 'about':
          this.$router.push('/about')
          break
      }
    },
    
    handleLoginSuccess(user) {
      console.log('用户登录成功:', user)
      // 可以在这里添加全局状态更新逻辑
    },
    
    handleLogout() {
      console.log('用户退出登录')
      // 可以在这里添加全局状态清理逻辑
      // 如果当前在需要登录的页面，可以跳转到首页
      if (this.$route.meta && this.$route.meta.requiresAuth) {
        this.$router.push('/')
      }
    },
    
    handleUserUpdated(user) {
      console.log('用户信息更新:', user)
      // 可以在这里添加全局状态更新逻辑
    },
    updateActiveMenu() {
      const path = this.$route.path
      if (path === '/') {
        this.activeIndex = 'home'
      } else if (path === '/projects' || path.startsWith('/projects/')) {
        this.activeIndex = 'projects'
      } else if (path === '/subscribed-projects') {
        this.activeIndex = 'subscribed-projects'
      } else if (path === '/about') {
        this.activeIndex = 'about'
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

/* 用户状态组件样式 */
.user-status-wrapper {
  margin-left: auto;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

/* 调整菜单样式以适应用户状态组件 */
.el-menu-demo {
  display: flex;
  align-items: center;
}

.el-menu-demo .el-menu-item {
  height: 60px;
  line-height: 60px;
}
</style>
