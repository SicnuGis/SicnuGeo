<template>
  <div class="map-editor">
    <div class="sidebar">
      <h3>项目要素编辑</h3>
      <div class="form-group">
        <label>项目名称</label>
        <input v-model="project.name" placeholder="请输入项目名称" />
      </div>
      <div class="form-group">
        <label>项目描述</label>
        <textarea v-model="project.description" placeholder="请输入项目描述" />
      </div>
      <div class="tools">
        <button :class="{active: currentTool==='point'}" @click="activateTool('point')">点</button>
        <button :class="{active: currentTool==='line'}" @click="activateTool('line')">线</button>
        <button :class="{active: currentTool==='polygon'}" @click="activateTool('polygon')">面</button>
        <button @click="deleteSelected">删除选中</button>
        <button @click="clearAll">清空</button>
      </div>
      <div class="attrs" v-if="selectedFeature">
        <h4>属性编辑</h4>
        <label>名称</label>
        <input v-model="selectedFeature.properties.name" />
        <label>类型</label>
        <input v-model="selectedFeature.properties.type" />
      </div>
      <div class="actions">
        <button class="primary" @click="saveProject">保存项目</button>
        <button @click="goBack">返回</button>
      </div>
    </div>
    <div class="map-container" ref="mapContainer"></div>
  </div>
</template>

<script>
import maplibregl from 'maplibre-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import { projectService } from '@/services/project.service'
import { useUserStore } from '@/store/index'

export default {
  name: 'ProjectMapEditor',
  data() {
    return {
      map: null,
      draw: null,
      currentTool: null,
      selectedId: null,
      selectedFeature: null,
      mode: this.$route.name === 'ProjectCreate' ? 'create' : 'edit',
      projectId: this.$route.params.id || null,
      project: {
        name: '',
        description: ''
      }
    }
  },
  mounted() {
    this.userStore = useUserStore()
    this.initMap()
    if (this.mode === 'edit' && this.projectId) {
      this.loadProject()
    }
  },
  beforeDestroy() {
    if (this.map) this.map.remove()
  },
  methods: {
    async loadProject() {
      const project = await projectService.getProjectById(this.projectId)
      this.project.name = project.name
      this.project.description = project.description
      // 加载要素
      const features = await projectService.getProjectFeatures(this.projectId)
      if (features && features.features) {
        this.draw.set(features)
      }
    },
    initMap() {
      this.map = new maplibregl.Map({
        container: this.$refs.mapContainer,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            { id: 'osm', type: 'raster', source: 'osm' }
          ]
        },
        center: [104.06, 30.67],
        zoom: 10
      })

      this.draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          point: false,
          line_string: false,
          polygon: false,
          trash: false
        }
      })

      this.map.addControl(this.draw)
      this.map.addControl(new maplibregl.NavigationControl(), 'top-left')

      this.map.on('draw.create', this.handleDrawUpdate)
      this.map.on('draw.update', this.handleDrawUpdate)
      this.map.on('draw.selectionchange', this.onSelectionChange)
    },
    handleDrawUpdate(e) {
      if (e && e.features && e.features.length > 0) {
        const f = e.features[0]
        this.selectedId = f.id
        // 确保属性对象存在
        f.properties = f.properties || { name: '', type: '' }
        this.selectedFeature = f
      }
    },
    onSelectionChange(e) {
      if (e.features && e.features.length) {
        const f = e.features[0]
        f.properties = f.properties || { name: '', type: '' }
        this.selectedFeature = f
        this.selectedId = f.id
      } else {
        this.selectedFeature = null
        this.selectedId = null
      }
    },
    activateTool(tool) {
      this.currentTool = tool
      if (tool === 'point') this.draw.changeMode('draw_point')
      if (tool === 'line') this.draw.changeMode('draw_line_string')
      if (tool === 'polygon') this.draw.changeMode('draw_polygon')
    },
    deleteSelected() {
      if (this.selectedId) {
        this.draw.delete(this.selectedId)
        this.selectedFeature = null
        this.selectedId = null
      }
    },
    clearAll() {
      this.draw.deleteAll()
      this.selectedFeature = null
      this.selectedId = null
    },
    async saveProject() {
      if (!this.project.name) {
        alert('请填写项目名称')
        return
      }
      const geojson = this.draw.getAll()
      try {
        let saved
        if (this.mode === 'create') {
          saved = await projectService.createProject({
            name: this.project.name,
            description: this.project.description
          })
          await projectService.saveProjectFeatures(saved.id, geojson)
          this.$router.push({ name: 'ProjectDetail', params: { id: saved.id } })
        } else {
          await projectService.updateProject(this.projectId, {
            name: this.project.name,
            description: this.project.description
          })
          await projectService.saveProjectFeatures(this.projectId, geojson)
          this.$router.push({ name: 'ProjectDetail', params: { id: this.projectId } })
        }
      } catch (e) {
        console.error(e)
        alert('保存失败，请稍后再试')
      }
    },
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.map-editor {
  display: flex;
  height: calc(100vh - 120px);
}
.sidebar {
  width: 320px;
  padding: 12px;
  border-right: 1px solid #eee;
  background: #fafafa;
  overflow: auto;
}
.map-container {
  flex: 1;
}
.tools button {
  margin-right: 8px;
}
.tools .active {
  background: #4096ff;
  color: #fff;
}
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}
.form-group input, .form-group textarea {
  padding: 6px 8px;
}
.attrs {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}
.actions { margin-top: 16px; display:flex; gap: 8px; }
.actions .primary { background:#4096ff; color:#fff; border:none; padding:8px 12px; }
</style>