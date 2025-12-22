import Vue from 'vue'
import App from './APP.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@arcgis/core/assets/esri/themes/light/main.css'

// 引入 Pinia
import { createPinia, PiniaVuePlugin } from 'pinia';

// 安装 Pinia 插件
Vue.use(PiniaVuePlugin);

// 创建 Pinia 实例
const pinia = createPinia();

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
  pinia,//注入 Pinia 状态管理
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