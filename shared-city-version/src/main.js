import Vue from 'vue'
import App from './APP.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 导入工具类
import * as CesiumHelper from './utils/cesium.helper'
import * as GeoUtils from './utils/geo.utils'

// 全局注册ElementUI
Vue.use(ElementUI)

// 将工具类挂载到Vue原型上
//方便全局调用
Vue.prototype.$cesium = CesiumHelper
Vue.prototype.$geo = GeoUtils

Vue.config.productionTip = false
//创建vue根实例
new Vue({
  router,//注入路由
  store,//注入状态管理
  render: h => h(App)//渲染根组件
}).$mount('#app')

// 添加全局错误处理
Vue.config.errorHandler = function(err, vm, info) {
  console.error('全局错误:', err, info)
  // 可以添加错误上报逻辑
}

// 监听未处理的 Promise 拒绝事件
document.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason)
})