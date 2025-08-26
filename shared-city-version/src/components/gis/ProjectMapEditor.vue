<template>
  <div class="map-editor" :style="embed ? { height: height || '520px' } : {}">
    <div class="sidebar">
      <h3>项目要素编辑</h3>
      <div class="form-group">
        <label>项目名称</label>
        <input v-model="project.name" placeholder="请输入项目名称" />
      </div>
      <div class="form-group">
        <label>项目类别</label>
        <select v-model="project.category">
          <option value="">请选择项目类别</option>
          <option value="PUBLIC_FACILITIES">公共设施工程</option>
          <option value="TRANSPORTATION">交通运输工程</option>
          <option value="RESIDENTIAL">住宅建设工程</option>
          <option value="COMMERCIAL">商业开发工程</option>
          <option value="INDUSTRIAL">工业园区工程</option>
          <option value="GREEN_SPACE">绿地景观工程</option>
          <option value="EDUCATION">教育设施工程</option>
          <option value="HEALTHCARE">医疗设施工程</option>
        </select>
      </div>
      <div class="form-group">
        <label>负责人</label>
        <input v-model="project.manager" placeholder="请输入项目负责人" />
      </div>
      <div class="form-group">
        <label>项目地址</label>
        <input v-model="project.address" placeholder="请输入项目地址" />
      </div>
      <div class="form-group">
        <label>投资金额（万元）</label>
        <input v-model="project.investment" type="number" placeholder="请输入投资金额" />
      </div>
      <div class="form-group">
        <label>创建时间</label>
        <input v-model="project.createDate" type="date" />
      </div>
      <div class="form-group">
        <label>开始时间</label>
        <input v-model="project.startDate" type="date" />
      </div>
      <div class="form-group">
        <label>结束时间</label>
        <input v-model="project.endDate" type="date" />
      </div>
      <div class="form-group">
        <label>项目描述</label>
        <textarea v-model="project.description" placeholder="请输入项目描述" />
      </div>
      <div class="form-group">
        <label>项目书上传</label>
        <input type="file" @change="handleDocumentUpload" accept=".pdf,.doc,.docx" multiple />
        <div v-if="project.documents && project.documents.length > 0" class="file-list">
          <div v-for="(doc, index) in project.documents" :key="index" class="file-item">
            <span>{{ doc.name }}</span>
            <button @click="removeDocument(index)" class="remove-btn">×</button>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>SHP文件上传</label>
        <input type="file" @change="handleShpUpload" accept=".shp,.dbf,.shx,.prj" multiple />
        <div v-if="project.shpFiles && project.shpFiles.length > 0" class="file-list">
          <div v-for="(shp, index) in project.shpFiles" :key="index" class="file-item">
            <span>{{ shp.name }}</span>
            <button @click="removeShpFile(index)" class="remove-btn">×</button>
          </div>
        </div>
        <div v-if="shpParseResult" class="shp-info">
          <h5>SHP文件信息：</h5>
          <p>要素数量: {{ shpParseResult.features?.length || 0 }}</p>
          <p>几何类型: {{ shpStatistics?.geometryTypes?.join(', ') || '未知' }}</p>
        </div>
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
        <input v-model="selectedFeature.properties.name" @input="updateGraphicAttributes" />
        <label>类型</label>
        <input v-model="selectedFeature.properties.type" @input="updateGraphicAttributes" />
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
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import Sketch from '@arcgis/core/widgets/Sketch'
import Graphic from '@arcgis/core/Graphic'
import Point from '@arcgis/core/geometry/Point'
import Polyline from '@arcgis/core/geometry/Polyline'
import Polygon from '@arcgis/core/geometry/Polygon'
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer'
import { projectService } from '@/services/project.service'
import { useUserStore } from '@/store/index'
import { getCategoryLabel } from '@/services/category.service'
import { parseShpFiles, validateShpFiles, getShpStatistics } from '@/services/shp.service'

export default {
  name: 'ProjectMapEditor',
  props: {
    embed: { type: Boolean, default: false },
    height: { type: String, default: '' },
    modeProp: { type: String, default: '' }, // 'create' | 'edit'
    projectIdProp: { type: [String, Number], default: null }
  },
  data() {
    return {
      map: null,
      view: null,
      sketch: null,
      graphicsLayer: null,
      currentTool: null,
      selectedGraphic: null,
      selectedFeature: null,
      mode: this.modeProp || (this.$route?.name === 'ProjectCreate' ? 'create' : 'edit'),
      projectId: this.projectIdProp || this.$route?.params?.id || null,
      project: {
        name: '',
        description: '',
        category: '',
        manager: '',
        address: '',
        investment: '',
        createDate: new Date().toISOString().split('T')[0],
        startDate: '',
        endDate: '',
        documents: [],
        shpFiles: [],
        geoData: null,
        geoBounds: null
      },
      shpParseResult: null,
      shpStatistics: null
    }
  },
  mounted() {
    this.userStore = useUserStore()
    // 在 embed 模式 + edit 时，需要外部传入 projectIdProp
    if (this.embed && this.mode === 'edit' && !this.projectId) {
      console.warn('[ProjectMapEditor] embed+edit 模式需要提供 projectIdProp')
    }
    this.initMap()
    if (this.mode === 'edit' && this.projectId) {
      this.loadProject()
    }
  },
  beforeDestroy() {
    if (this.view) {
      this.view.destroy()
    }
  },
  methods: {
    async loadProject() {
      const project = await projectService.getProjectById(this.projectId)
      this.project.name = project.name
      this.project.description = project.description
      // 加载要素
      const features = await projectService.getProjectFeatures(this.projectId)
      if (features && features.features) {
        await this.loadGeoJSONToMap(features)
      }
    },
    async initMap() {
      try {
        // 创建图形图层
        this.graphicsLayer = new GraphicsLayer()

        // 创建地图
        this.map = new Map({
          basemap: 'streets-navigation-vector',
          layers: [this.graphicsLayer]
        })

        // 创建地图视图
        this.view = new MapView({
          container: this.$refs.mapContainer,
          map: this.map,
          center: [104.06, 30.67],
          zoom: 10
        })

        // 创建绘制工具
        this.sketch = new Sketch({
          layer: this.graphicsLayer,
          view: this.view,
          creationMode: 'single'
        })

        // 监听绘制事件
        this.sketch.on('create', this.handleSketchCreate)
        this.sketch.on('update', this.handleSketchUpdate)
        this.sketch.on('delete', this.handleSketchDelete)

        // 监听图形选择事件
        this.view.on('click', this.handleGraphicClick)

      } catch (error) {
        console.error('初始化地图失败:', error)
      }
    },
    handleSketchCreate(event) {
      const graphic = event.graphic
      // 为新创建的图形添加属性
      graphic.attributes = graphic.attributes || { name: '', type: '' }
      this.selectedGraphic = graphic
      this.selectedFeature = this.convertGraphicToGeoJSON(graphic)
    },
    handleSketchUpdate(event) {
      if (event.graphics && event.graphics.length > 0) {
        const graphic = event.graphics[0]
        this.selectedGraphic = graphic
        this.selectedFeature = this.convertGraphicToGeoJSON(graphic)
      }
    },
    handleSketchDelete(event) {
      this.selectedGraphic = null
      this.selectedFeature = null
    },
    async handleGraphicClick(event) {
      const response = await this.view.hitTest(event)
      if (response.results.length > 0) {
        const graphic = response.results[0].graphic
        if (this.graphicsLayer.graphics.includes(graphic)) {
          this.selectedGraphic = graphic
          this.selectedFeature = this.convertGraphicToGeoJSON(graphic)
        }
      }
    },
    activateTool(tool) {
      this.currentTool = tool
      if (!this.sketch) return
      
      if (tool === 'point') {
        this.sketch.create('point')
      } else if (tool === 'line') {
        this.sketch.create('polyline')
      } else if (tool === 'polygon') {
        this.sketch.create('polygon')
      }
    },
    deleteSelected() {
      if (this.selectedGraphic && this.graphicsLayer) {
        this.graphicsLayer.remove(this.selectedGraphic)
        this.selectedGraphic = null
        this.selectedFeature = null
      }
    },
    clearAll() {
      if (this.graphicsLayer) {
        this.graphicsLayer.removeAll()
      }
      this.selectedGraphic = null
      this.selectedFeature = null
    },
    async saveProject() {
      if (!this.project.name) {
        alert('请填写项目名称')
        return
      }
      if (!this.project.category) {
        alert('请选择项目类别')
        return
      }
      const geojson = this.getAllGraphicsAsGeoJSON()
      
      // 合并SHP数据到geojson中
      if (this.shpParseResult && this.shpParseResult.features) {
        geojson.features = [...geojson.features, ...this.shpParseResult.features]
      }
      
      try {
        let saved
        if (this.mode === 'create') {
          saved = await projectService.createProject({
            name: this.project.name,
            description: this.project.description,
            category: this.project.category,
            manager: this.project.manager,
            address: this.project.address,
            investment: this.project.investment,
            createDate: this.project.createDate,
            startDate: this.project.startDate,
            endDate: this.project.endDate,
            documents: this.project.documents,
            shpFiles: this.project.shpFiles,
            geoData: this.shpParseResult,
            geoBounds: this.shpStatistics?.bounds
          })
          await projectService.saveProjectFeatures(saved.id, geojson)
          if (this.embed) {
            this.$emit('saved', saved)
          } else {
            this.$router.push({ name: 'ProjectDetail', params: { id: saved.id } })
          }
        } else {
          await projectService.updateProject(this.projectId, {
            name: this.project.name,
            description: this.project.description
          })
          await projectService.saveProjectFeatures(this.projectId, geojson)
          if (this.embed) {
            this.$emit('saved', { id: this.projectId })
          } else {
            this.$router.push({ name: 'ProjectDetail', params: { id: this.projectId } })
          }
        }
      } catch (e) {
        console.error(e)
        alert('保存失败，请稍后再试')
      }
    },
    goBack() {
      if (this.embed) {
        this.$emit('cancel')
      } else {
        this.$router.back()
      }
    },

    // 获取分类标签
    getCategoryLabel(category) {
      return getCategoryLabel(category)
    },

    // 处理项目书上传
    handleDocumentUpload(event) {
      const files = Array.from(event.target.files)
      files.forEach(file => {
        this.project.documents.push({
          name: file.name,
          size: file.size,
          type: file.type,
          file: file
        })
      })
    },

    // 移除项目书
    removeDocument(index) {
      this.project.documents.splice(index, 1)
    },

    // 处理SHP文件上传
    async handleShpUpload(event) {
      const files = Array.from(event.target.files)
      
      // 添加文件到列表
      files.forEach(file => {
        this.project.shpFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          file: file
        })
      })

      try {
        // 验证SHP文件集
        const allShpFiles = this.project.shpFiles.map(item => item.file)
        const validation = validateShpFiles(allShpFiles)
        if (!validation.valid) {
          alert('SHP文件验证失败: ' + validation.message)
          return
        }

        // 解析SHP文件
        const parseResult = await parseShpFiles(allShpFiles)
        if (parseResult.success) {
          this.shpParseResult = parseResult.data
          this.shpStatistics = getShpStatistics(parseResult.data)
          
          // 在地图上显示SHP数据
          this.displayShpOnMap(parseResult.data)
          
          console.log('SHP文件解析成功:', {
            features: parseResult.data.features?.length || 0,
            geometryTypes: this.shpStatistics.geometryTypes,
            bounds: this.shpStatistics.bounds
          })
        } else {
          alert('SHP文件解析失败: ' + parseResult.error)
        }
      } catch (error) {
        console.error('处理SHP文件时出错:', error)
        alert('处理SHP文件时出错: ' + error.message)
      }
    },

    // 移除SHP文件
    removeShpFile(index) {
      this.project.shpFiles.splice(index, 1)
      // 如果移除了所有SHP文件，清除解析结果
      if (this.project.shpFiles.length === 0) {
        this.shpParseResult = null
        this.shpStatistics = null
        this.removeShpFromMap()
      }
    },

    // 在地图上显示SHP数据
    async displayShpOnMap(geoJsonData) {
      if (!this.view || !geoJsonData || !geoJsonData.features) return

      // 移除之前的SHP图层
      await this.removeShpFromMap()

      try {
        // 创建GeoJSON图层
        const shpLayer = new GeoJSONLayer({
          source: geoJsonData.features,
          id: 'shp-layer',
          renderer: {
            type: 'simple',
            symbol: {
              type: 'simple-fill',
              color: [0, 136, 136, 0.3],
              outline: {
                color: [0, 136, 136, 1],
                width: 2
              }
            }
          }
        })

        // 添加图层到地图
        this.view.map.add(shpLayer)

        // 缩放到SHP数据范围
        if (this.shpStatistics && this.shpStatistics.bounds) {
          const bounds = this.shpStatistics.bounds
          await this.view.goTo({
            target: [
              [bounds.minLng, bounds.minLat],
              [bounds.maxLng, bounds.maxLat]
            ]
          })
        }
      } catch (error) {
        console.error('显示SHP数据时出错:', error)
      }
    },

    // 从地图移除SHP数据
    async removeShpFromMap() {
      if (!this.view) return
      
      try {
        const layers = this.view.map.layers.filter(layer => 
          layer.id && layer.id.startsWith('shp-')
        )
        layers.forEach(layer => {
          this.view.map.remove(layer)
        })
      } catch (error) {
        console.warn('移除SHP图层时出错:', error)
      }
    },

    // 将Esri图形转换为GeoJSON要素
    convertGraphicToGeoJSON(graphic) {
      if (!graphic || !graphic.geometry) return null
      
      const geometry = graphic.geometry
      let geoJsonGeometry = null
      
      if (geometry.type === 'point') {
        geoJsonGeometry = {
          type: 'Point',
          coordinates: [geometry.longitude, geometry.latitude]
        }
      } else if (geometry.type === 'polyline') {
        geoJsonGeometry = {
          type: 'LineString',
          coordinates: geometry.paths[0] || []
        }
      } else if (geometry.type === 'polygon') {
        geoJsonGeometry = {
          type: 'Polygon',
          coordinates: geometry.rings || []
        }
      }
      
      return {
        type: 'Feature',
        geometry: geoJsonGeometry,
        properties: graphic.attributes || { name: '', type: '' }
      }
    },

    // 获取所有图形作为GeoJSON
    getAllGraphicsAsGeoJSON() {
      const features = []
      
      if (this.graphicsLayer && this.graphicsLayer.graphics) {
        this.graphicsLayer.graphics.forEach(graphic => {
          const feature = this.convertGraphicToGeoJSON(graphic)
          if (feature) {
            features.push(feature)
          }
        })
      }
      
      return {
        type: 'FeatureCollection',
        features: features
      }
    },

    // 从GeoJSON加载图形到地图
    async loadGeoJSONToMap(geoJsonData) {
      if (!geoJsonData || !geoJsonData.features || !this.graphicsLayer) return
      
      try {
         geoJsonData.features.forEach(feature => {
           let geometry = null
           
           if (feature.geometry.type === 'Point') {
             geometry = new Point({
               longitude: feature.geometry.coordinates[0],
               latitude: feature.geometry.coordinates[1]
             })
           } else if (feature.geometry.type === 'LineString') {
             geometry = new Polyline({
               paths: [feature.geometry.coordinates]
             })
           } else if (feature.geometry.type === 'Polygon') {
             geometry = new Polygon({
               rings: feature.geometry.coordinates
             })
           }
           
           if (geometry) {
             const graphic = new Graphic({
               geometry: geometry,
               attributes: feature.properties || { name: '', type: '' }
             })
             
             this.graphicsLayer.add(graphic)
           }
         })
      } catch (error) {
         console.error('加载GeoJSON到地图时出错:', error)
       }
     },

     // 更新图形属性
     updateGraphicAttributes() {
       if (this.selectedGraphic && this.selectedFeature) {
         this.selectedGraphic.attributes = {
           ...this.selectedGraphic.attributes,
           name: this.selectedFeature.properties.name,
           type: this.selectedFeature.properties.type
         }
       }
     }
  }
}
</script>

<style scoped>
@import 'https://js.arcgis.com/4.33/esri/themes/light/main.css';

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
  margin-bottom: 12px;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 4px;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4096ff;
  box-shadow: 0 0 0 3px rgba(64, 150, 255, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.file-list {
  margin-top: 8px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 13px;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #c82333;
}

.shp-info {
  margin-top: 8px;
  padding: 8px;
  background: #e8f5e8;
  border: 1px solid #c3e6c3;
  border-radius: 4px;
  font-size: 13px;
}

.shp-info h5 {
  margin: 0 0 4px 0;
  color: #155724;
}

.shp-info p {
  margin: 2px 0;
  color: #155724;
}

.form-group input[type="file"] {
  padding: 4px;
  border: 2px dashed #d1d5db;
  background: #f8f9fa;
}

.form-group input[type="file"]:hover {
  border-color: #4096ff;
  background: #f0f8ff;
}


.form-group input, .form-group textarea {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
.primary {
  background: #4096ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
}
</style>