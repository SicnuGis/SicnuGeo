// 在Vite中，我们直接使用全局Cesium对象，因为它已经在index.html中通过CDN引入
const Cesium = window.Cesium

/**
 * Cesium 辅助工具类
 * 提供坐标系转换、3D Tiles 优化等功能
 */
class CesiumHelper {
  /**
   * 初始化 Cesium 视图器
   * @param {string|HTMLElement} container - 容器 ID 或 DOM 元素
   * @param {Object} options - Cesium 配置选项
   * @returns {Cesium.Viewer} Cesium 视图器实例
   */
  static initViewer(container, options = {}) {
    // 默认配置
    const defaultOptions = {
      terrainProvider: Cesium.createWorldTerrain(),
      imageryProvider: new Cesium.UrlTemplateImageryProvider({
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c']
      }),
      baseLayerPicker: false,
      fullscreenButton: false,
      homeButton: false,
      infoBox: false,
      navigationHelpButton: false,
      sceneModePicker: true,
      animation: false,
      timeline: false
    }

    // 合并配置
    const mergedOptions = { ...defaultOptions, ...options }

    // 创建视图器
    const viewer = new Cesium.Viewer(container, mergedOptions)

    // 优化性能
    this.optimizePerformance(viewer)

    return viewer
  }

  /**
   * 优化 Cesium 性能
   * @param {Cesium.Viewer} viewer - Cesium 视图器实例
   */
  static optimizePerformance(viewer) {
    // 关闭不必要的渲染效果
    viewer.scene.fog.enabled = false
    viewer.scene.globe.enableLighting = false

    // 设置视锥体剔除
    viewer.scene.skipDepthTestAgainstTerrain = true

    // 优化内存管理
    viewer.scene.requestRenderMode = true
    viewer.scene.maximumRenderTimeChange = Infinity
  }

  /**
   * 加载 3D Tiles 模型
   * @param {Cesium.Viewer} viewer - Cesium 视图器实例
   * @param {string} url - 3D Tiles 模型 URL
   * @param {Object} options - 加载选项
   * @returns {Promise<Cesium.Cesium3DTileset>} 加载的 3D Tiles 集
   */
  static async load3DTileset(viewer, url, options = {}) {
    try {
      const tileset = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url,
          ...options
        })
      )

      // 优化 3D Tiles 加载
      this.optimize3DTileset(tileset)

      await tileset.readyPromise
      return tileset
    } catch (error) {
      console.error('加载 3D Tiles 失败:', error)
      throw error
    }
  }

  /**
   * 优化 3D Tiles 性能
   * @param {Cesium.Cesium3DTileset} tileset - 3D Tiles 集
   */
  static optimize3DTileset(tileset) {
    // 设置最大屏幕空间错误
    tileset.maxScreenSpaceError = 16

    // 启用视锥体剔除
    tileset.cullWithChildrenBounds = true

    // 设置最大内存使用
    tileset.maximumMemoryUsage = 512

    // 优化渲染顺序
    tileset.renderOrder = 0
  }

  /**
   * WGS84 坐标转笛卡尔坐标
   * @param {number} lng - 经度
   * @param {number} lat - 纬度
   * @param {number} height - 高度
   * @returns {Cesium.Cartesian3} 笛卡尔坐标
   */
  static wgs84ToCartesian(lng, lat, height = 0) {
    return Cesium.Cartesian3.fromDegrees(lng, lat, height)
  }

  /**
   * 笛卡尔坐标转 WGS84 坐标
   * @param {Cesium.Cartesian3} cartesian - 笛卡尔坐标
   * @returns {Object} WGS84 坐标 {lng, lat, height}
   */
  static cartesianToWgs84(cartesian) {
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    return {
      lng: Cesium.Math.toDegrees(cartographic.longitude),
      lat: Cesium.Math.toDegrees(cartographic.latitude),
      height: cartographic.height
    }
  }

  /**
   * 屏幕坐标转世界坐标
   * @param {Cesium.Viewer} viewer - Cesium 视图器实例
   * @param {number} x - 屏幕 X 坐标
   * @param {number} y - 屏幕 Y 坐标
   * @returns {Object|null} 世界坐标 {lng, lat, height} 或 null（如果点击天空）
   */
  static screenToWorld(viewer, x, y) {
    const ray = viewer.camera.getPickRay(new Cesium.Cartesian2(x, y))
    const intersection = viewer.scene.globe.pick(ray, viewer.scene)

    if (!intersection) return null

    return this.cartesianToWgs84(intersection)
  }

  /**
   * 创建点标记
   * @param {Cesium.Viewer} viewer - Cesium 视图器实例
   * @param {number} lng - 经度
   * @param {number} lat - 纬度
   * @param {number} height - 高度
   * @param {Object} options - 点标记选项
   * @returns {Cesium.Entity} 点标记实体
   */
  static createPointMarker(viewer, lng, lat, height = 0, options = {}) {
    const defaultOptions = {
      position: this.wgs84ToCartesian(lng, lat, height),
      point: {
        pixelSize: 10,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2
      }
    }

    const mergedOptions = { ...defaultOptions, ...options }
    return viewer.entities.add(mergedOptions)
  }

  /**
   * 飞行动画到指定位置
   * @param {Cesium.Viewer} viewer - Cesium 视图器实例
   * @param {number} lng - 经度
   * @param {number} lat - 纬度
   * @param {number} height - 高度
   * @param {number} duration - 动画持续时间（秒）
   * @returns {Promise} 飞行完成的 Promise
   */
  static flyTo(viewer, lng, lat, height = 1000, duration = 3) {
    return viewer.camera.flyTo({
      destination: this.wgs84ToCartesian(lng, lat, height),
      duration,
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0
      }
    })
  }
}

export default CesiumHelper