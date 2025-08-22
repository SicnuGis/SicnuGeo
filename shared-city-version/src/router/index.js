import Vue from 'vue'
import VueRouter from 'vue-router'

// 导入组件
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import ProjectAdmin from '../components/ProjectAdmin.vue'
import ProjectTimeLine from '../components/charts/ProjectTimeLine.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/projects',
    name: 'ProjectAdmin',
    component: ProjectAdmin
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: ProjectTimeLine
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
