import Vue from 'vue'
import VueRouter from 'vue-router'
import authService from '@/services/auth.service'

// 导入组件
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import ProjectAdmin from '../views/ProjectAdmin.vue'
import SubscribedProjects from '../views/SubscribedProjects.vue'
import ProjectTimeLine from '../components/charts/ProjectTimeLine.vue'
import Login from '../views/Login.vue'
import ProjectMapEditor from '@/components/gis/ProjectMapEditor.vue'
import AIChatView from '../views/AIChatView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/ai-chat',
    name: 'AIChat',
    component: AIChatView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/projects',
    name: 'ProjectAdmin',
    component: ProjectAdmin,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/new',
    name: 'ProjectCreate',
    component: ProjectMapEditor,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:id/edit',
    name: 'ProjectEdit',
    component: ProjectMapEditor,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: ProjectTimeLine,
    meta: { requiresAuth: true }
  },
  {
    path: '/subscribed-projects',
    name: 'SubscribedProjects',
    component: SubscribedProjects,
    meta: { requiresAuth: true }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL || '/',
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
