import Vue from 'vue'
import App from './App.vue'
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
Vue.prototype.$cesium = CesiumHelper
Vue.prototype.$geo = GeoUtils

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

// 添加全局错误处理
Vue.config.errorHandler = function(err, vm, info) {
  console.error('全局错误:', err, info)
  // 可以添加错误上报逻辑
}

document.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason)
})