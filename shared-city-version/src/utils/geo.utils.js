/**
 * 地理计算工具类
 * 提供坐标转换、距离计算、几何操作等地理空间算法
 */
class GeoUtils {
  /**
   * 地球半径（千米）
   */
  static EARTH_RADIUS = 6371.0088

  /**
   * 将角度转换为弧度
   * @param {number} degrees - 角度值
   * @returns {number} 弧度值
   */
  static toRadians(degrees) {
    return degrees * Math.PI / 180
  }

  /**
   * 将弧度转换为角度
   * @param {number} radians - 弧度值
   * @returns {number} 角度值
   */
  static toDegrees(radians) {
    return radians * 180 / Math.PI
  }

  /**
   * 计算两点之间的地理距离（Haversine公式）
   * @param {Object} point1 - 第一个点 {lng, lat}
   * @param {Object} point2 - 第二个点 {lng, lat}
   * @param {string} unit - 单位 ('km' 或 'm')
   * @returns {number} 两点之间的距离
   */
  static calculateDistance(point1, point2, unit = 'km') {
    const lat1 = this.toRadians(point1.lat)
    const lon1 = this.toRadians(point1.lng)
    const lat2 = this.toRadians(point2.lat)
    const lon2 = this.toRadians(point2.lng)

    const dLat = lat2 - lat1
    const dLon = lon2 - lon1

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    let distance = this.EARTH_RADIUS * c

    if (unit === 'm') {
      distance *= 1000
    }

    return distance
  }

  /**
   * 计算多边形面积
   * @param {Array<Object>} polygon - 多边形顶点数组 [{lng, lat}, ...]
   * @returns {number} 面积（平方千米）
   */
  static calculatePolygonArea(polygon) {
    if (polygon.length < 3) return 0

    let area = 0
    const n = polygon.length

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      const xi = this.toRadians(polygon[i].lng)
      const yi = this.toRadians(polygon[i].lat)
      const xj = this.toRadians(polygon[j].lng)
      const yj = this.toRadians(polygon[j].lat)

      area += (xj - xi) * Math.cos((yi + yj) / 2)
    }

    area = Math.abs(area) * this.EARTH_RADIUS * this.EARTH_RADIUS / 2
    return area
  }

  /**
   * 检查点是否在多边形内部
   * @param {Object} point - 点 {lng, lat}
   * @param {Array<Object>} polygon - 多边形顶点数组 [{lng, lat}, ...]
   * @returns {boolean} 是否在内部
   */
  static isPointInPolygon(point, polygon) {
    const x = point.lng
    const y = point.lat
    let inside = false

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng
      const yi = polygon[i].lat
      const xj = polygon[j].lng
      const yj = polygon[j].lat

      const intersect = ((yi > y) !== (yj > y)) &&
                       (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }

    return inside
  }

  /**
   * 生成缓冲区
   * @param {Object} point - 中心点 {lng, lat}
   * @param {number} radius - 半径（米）
   * @param {number} segments - 分段数
   * @returns {Array<Object>} 缓冲区多边形顶点
   */
  static createBuffer(point, radius, segments = 32) {
    const { lng, lat } = point
    const radiusInDegrees = radius / 111319.9 // 近似 1 米对应的经度度数
    const points = []

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * 2 * Math.PI
      const dx = radiusInDegrees * Math.cos(angle)
      const dy = radiusInDegrees * Math.sin(angle) / Math.cos(this.toRadians(lat))

      points.push({
        lng: lng + dx,
        lat: lat + dy
      })
    }

    // 闭合多边形
    points.push(points[0])

    return points
  }

  /**
   * WGS84 转 GCJ02 (火星坐标系)
   * @param {Object} point - WGS84 坐标 {lng, lat}
   * @returns {Object} GCJ02 坐标 {lng, lat}
   */
  static wgs84ToGcj02(point) {
    const { lng, lat } = point
    // 实现 WGS84 到 GCJ02 的转换算法
    // 这里省略具体实现，可以使用第三方库如 proj4js
    return { lng, lat } // 占位返回
  }

  /**
   * GCJ02 转 WGS84
   * @param {Object} point - GCJ02 坐标 {lng, lat}
   * @returns {Object} WGS84 坐标 {lng, lat}
   */
  static gcj02ToWgs84(point) {
    const { lng, lat } = point
    // 实现 GCJ02 到 WGS84 的转换算法
    // 这里省略具体实现，可以使用第三方库如 proj4js
    return { lng, lat } // 占位返回
  }

  /**
   * 点聚类算法
   * @param {Array<Object>} points - 点数组 [{lng, lat}, ...]
   * @param {number} radius - 聚类半径（米）
   * @returns {Array<Object>} 聚类结果 [{center: {lng, lat}, points: [...]}, ...]
   */
  static clusterPoints(points, radius) {
    const clusters = []
    const processed = new Set()

    for (let i = 0; i < points.length; i++) {
      if (processed.has(i)) continue

      const cluster = {
        center: points[i],
        points: [points[i]]
      }

      processed.add(i)

      for (let j = i + 1; j < points.length; j++) {
        if (processed.has(j)) continue

        const distance = this.calculateDistance(points[i], points[j], 'm')
        if (distance <= radius) {
          cluster.points.push(points[j])
          processed.add(j)
        }
      }

      // 重新计算聚类中心
      cluster.center = this.calculateCentroid(cluster.points)
      clusters.push(cluster)
    }

    return clusters
  }

  /**
   * 计算点集的质心
   * @param {Array<Object>} points - 点数组 [{lng, lat}, ...]
   * @returns {Object} 质心坐标 {lng, lat}
   */
  static calculateCentroid(points) {
    if (points.length === 0) return { lng: 0, lat: 0 }

    let sumLng = 0
    let sumLat = 0

    for (const point of points) {
      sumLng += point.lng
      sumLat += point.lat
    }

    return {
      lng: sumLng / points.length,
      lat: sumLat / points.length
    }
  }
}

export default GeoUtils