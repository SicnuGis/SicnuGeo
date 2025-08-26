<template>
  <div class="arcgis-panel">
    <div class="toolbar">
      <el-button size="mini" @click="setSketchMode('point')">点</el-button>
      <el-button size="mini" @click="setSketchMode('polyline')">线</el-button>
      <el-button size="mini" @click="setSketchMode('polygon')">面</el-button>
      <el-button size="mini" type="primary" @click="doBuffer" :disabled="!canBuffer">缓冲区</el-button>
      <el-button size="mini" @click="toggleDistance">量距{{ distWidget ? '（关闭）' : '' }}</el-button>
      <el-button size="mini" @click="toggleArea">量面{{ areaWidget ? '（关闭）' : '' }}</el-button>
      <el-button size="mini" @click="clearGraphics">清空</el-button>
    </div>
    <div class="map-wrap" ref="mapWrap"></div>
    <div class="result" v-if="bufferArea">
      <div>缓冲区面积：{{ (bufferArea / 1e6).toFixed(3) }} 平方公里</div>
    </div>
  </div>
</template>

<script>
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import Basemap from '@arcgis/core/Basemap'
import TileLayer from '@arcgis/core/layers/TileLayer'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import Graphic from '@arcgis/core/Graphic'
import Sketch from '@arcgis/core/widgets/Sketch'
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine'
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer'
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils'
import { projectService } from '@/services/project.service'
import DistanceMeasurement2D from '@arcgis/core/widgets/DistanceMeasurement2D'
import AreaMeasurement2D from '@arcgis/core/widgets/AreaMeasurement2D'

export default {
  name: 'ArcgisAnalysisPanel',
  props: {
    projectId: { type: [String, Number], required: true },
    center: { type: Array, default: () => [104.0668, 30.5728] },
    zoom: { type: Number, default: 11 }
  },
  data() {
    return {
      view: null,
      map: null,
      drawLayer: null,
      bufferArea: 0,
      lastGeometry: null,
      projectLayer: null,
      sketch: null,
      distWidget: null,
      areaWidget: null
    }
  },
  computed: {
    canBuffer() { return !!this.lastGeometry }
  },
  mounted() {
    this.initMap()
  },
  beforeDestroy() {
    if (this.view) this.view.destroy()
  },
  methods: {
    async initMap() {
      const basemap = new Basemap({
        baseLayers: [
          new TileLayer({
            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer',
            title: 'World Street Map'
          })
        ]
      })

      this.map = new Map({ basemap })
      this.drawLayer = new GraphicsLayer()
      this.map.add(this.drawLayer)

      this.view = new MapView({
        container: this.$refs.mapWrap,
        map: this.map,
        center: this.center,
        zoom: this.zoom,
        constraints: { snapToZoom: false }
      })

      // 加载后端的项目要素（GeoJSON FeatureCollection）
      try {
        const fc = await projectService.getProjectFeatures(this.projectId)
        const blob = new Blob([JSON.stringify(fc)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        this.projectLayer = new GeoJSONLayer({ url, title: '项目要素' })
        this.map.add(this.projectLayer)
      } catch (e) {
        console.warn('加载项目要素失败，继续初始化绘制工具', e)
      }

      // 初始化 Sketch 绘制工具
      const sketch = new Sketch({ view: this.view, layer: this.drawLayer, creationMode: 'update' })
      this.sketch = sketch
      this.view.ui.add(sketch, 'top-right')

      sketch.on('create', (e) => {
        if (e.state === 'complete') this.onGeometryDrawn(e.graphic.geometry)
      })
      sketch.on('update', (e) => {
        if (e?.graphics?.length) this.onGeometryDrawn(e.graphics[0].geometry)
      })
    },
    onGeometryDrawn(geom) {
      this.lastGeometry = geom
      this.bufferArea = 0
    },
    setSketchMode(mode) {
      if (!this.view || !this.sketch) return
      const tool = mode === 'point' ? 'point' : mode === 'polyline' ? 'polyline' : 'polygon'
      if (this.sketch.create) this.sketch.create(tool)
    },
    clearGraphics() {
      this.drawLayer?.removeAll()
      this.lastGeometry = null
      this.bufferArea = 0
    },
    doBuffer() {
      if (!this.lastGeometry) return
      // 以米为单位缓冲 500m
      let g = this.lastGeometry
      if (g.spatialReference?.isWGS84 || g.spatialReference?.wkid === 4326) {
        // WGS84 -> WebMercator 以米进行度量
        g = webMercatorUtils.geographicToWebMercator(g)
      }
      const buffered = geometryEngine.buffer(g, 500, 'meters')
      if (buffered) {
        this.drawLayer.add(new Graphic({ geometry: buffered, symbol: {
          type: 'simple-fill', color: [64,150,255,0.15], outline: { color: [64,150,255,1], width: 1 }
        }}))
        this.bufferArea = Math.abs(geometryEngine.planarArea(buffered, 'square-meters'))
      }
    },
    toggleDistance() {
      if (!this.view) return
      if (this.distWidget) {
        this.view.ui.remove(this.distWidget)
        this.distWidget.destroy()
        this.distWidget = null
        return
      }
      this.distWidget = new DistanceMeasurement2D({ view: this.view })
      this.view.ui.add(this.distWidget, 'top-right')
    },
    toggleArea() {
      if (!this.view) return
      if (this.areaWidget) {
        this.view.ui.remove(this.areaWidget)
        this.areaWidget.destroy()
        this.areaWidget = null
        return
      }
      this.areaWidget = new AreaMeasurement2D({ view: this.view })
      this.view.ui.add(this.areaWidget, 'top-right')
    }
  }
}
</script>

<style scoped>
.arcgis-panel { display: flex; flex-direction: column; gap: 8px; }
.toolbar { display: flex; gap: 6px; }
.map-wrap { width: 100%; height: 420px; border: 1px solid #e5e7eb; border-radius: 6px; }
.result { font-size: 12px; color: #333; }
</style>