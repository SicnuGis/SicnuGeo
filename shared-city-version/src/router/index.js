import Vue from 'vue'
import VueRouter from 'vue-router'

// 导入组件
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import ProjectAdmin from '../components/ProjectAdmin.vue'
import ProjectTimeLine from '../components/charts/ProjectTimeLine.vue'
import Login from '../views/Login.vue'
import ProjectMapEditor from '@/components/gis/ProjectMapEditor.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
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
    component: ProjectAdmin
  },
  {
    path: '/projects/new',
    name: 'ProjectCreate',
    component: ProjectMapEditor
  },
  {
    path: '/projects/:id/edit',
    name: 'ProjectEdit',
    component: ProjectMapEditor
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: ProjectTimeLine
  }
]

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL || '/',
  routes
})

export default router
