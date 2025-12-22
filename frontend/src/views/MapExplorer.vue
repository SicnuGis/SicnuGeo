<template>
  <div class="map-explorer">
    <!-- 地图工具栏 -->
    <div class="map-toolbar">
      <div class="toolbar-left">
        <h2>智慧城市地图浏览器</h2>
      </div>
      <div class="toolbar-right">
        <div class="tool-group">
          <button 
            v-for="basemap in basemaps" 
            :key="basemap.id"
            :class="['btn-basemap', { active: currentBasemap === basemap.id }]"
            @click="changeBasemap(basemap.id)"
          >
            {{ basemap.name }}
          </button>
        </div>
        <div class="tool-group">
          <button class="btn-tool" :class="{ active: showLayers }" @click="toggleLayerPanel" title="管理地图图层">
            <i class="icon-layers"></i> 
            <span class="btn-text">图层</span>
          </button>
          <button class="btn-tool" :class="{ active: showMeasurement }" @click="toggleMeasurement" title="测量距离和面积">
            <i class="icon-measure"></i> 
            <span class="btn-text">测量</span>
          </button>
          <button class="btn-tool" :class="{ active: showAnalysis }" @click="toggleAnalysis" title="空间分析工具">
            <i class="icon-analysis"></i> 
            <span class="btn-text">分析</span>
          </button>
          <button class="btn-tool" :class="{ active: showProjectViewer }" @click="toggleProjectViewer" title="查看项目信息">
            <i class="icon-projects"></i> 
            <span class="btn-text">项目</span>
          </button>
          <button class="btn-tool" :class="{ active: showHeatmap }" @click="toggleHeatmap" title="显示热力图">
            <i class="icon-heatmap"></i> 
            <span class="btn-text">热力图</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="map-container" ref="mapContainer"></div>

    <!-- 图层面板 -->
    <div v-if="showLayerPanel" class="layer-panel">
      <div class="panel-header">
        <h3>图层管理</h3>
        <button class="btn-close" @click="showLayerPanel = false">×</button>
      </div>
      <div class="panel-content">
        <!-- 图层管理工具栏 -->
        <div class="layer-toolbar">
          <button class="btn-small" @click="addCustomLayer">
            <i class="icon-add"></i> 添加图层
          </button>
          <button class="btn-small" @click="importLayerData">
            <i class="icon-import"></i> 导入数据
          </button>
          <button class="btn-small" @click="exportLayerData">
            <i class="icon-export"></i> 导出数据
          </button>
        </div>

        <!-- 基础图层 -->
        <div class="layer-category">
          <h4>基础图层</h4>
          <div v-for="layer in baseLayers" :key="layer.id" class="layer-item">
            <div class="layer-header">
              <label class="layer-checkbox">
                <input 
                  type="checkbox" 
                  :checked="layer.visible" 
                  @change="toggleLayer(layer.id)"
                >
                <span class="layer-name">{{ layer.name }}</span>
              </label>
              <div class="layer-actions">
                <button class="btn-icon" @click="zoomToLayer(layer.id)" title="缩放到图层">
                  <i class="icon-zoom"></i>
                </button>
                <button class="btn-icon" @click="showLayerInfo(layer.id)" title="图层信息">
                  <i class="icon-info"></i>
                </button>
              </div>
            </div>
            <div v-if="layer.visible" class="layer-controls">
              <div class="control-group">
                <label>透明度: {{ Math.round(layer.opacity * 100) }}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  :value="layer.opacity" 
                  @input="changeLayerOpacity(layer.id, $event.target.value)"
                  class="opacity-slider"
                >
              </div>
            </div>
          </div>
        </div>
        
        <!-- 业务图层 -->
        <div class="layer-category">
          <h4>业务图层</h4>
          <div v-for="layer in businessLayers" :key="layer.id" class="layer-item">
            <div class="layer-header">
              <label class="layer-checkbox">
                <input 
                  type="checkbox" 
                  :checked="layer.visible" 
                  @change="toggleLayer(layer.id)"
                >
                <span class="layer-name">{{ layer.name }}</span>
              </label>
              <div class="layer-actions">
                <button class="btn-icon" @click="zoomToLayer(layer.id)" title="缩放到图层">
                  <i class="icon-zoom"></i>
                </button>
                <button class="btn-icon" @click="showLayerInfo(layer.id)" title="图层信息">
                  <i class="icon-info"></i>
                </button>
                <button class="btn-icon" @click="removeLayer(layer.id)" title="移除图层">
                  <i class="icon-delete"></i>
                </button>
              </div>
            </div>
            <div v-if="layer.visible" class="layer-controls">
              <div class="control-group">
                <label>透明度: {{ Math.round(layer.opacity * 100) }}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  :value="layer.opacity" 
                  @input="changeLayerOpacity(layer.id, $event.target.value)"
                  class="opacity-slider"
                >
              </div>
              <div v-if="layer.type === 'feature'" class="control-group">
                <label>符号大小:</label>
                <input 
                  type="range" 
                  min="4" 
                  max="20" 
                  step="2" 
                  :value="layer.symbolSize || 8" 
                  @input="changeSymbolSize(layer.id, $event.target.value)"
                  class="size-slider"
                >
              </div>
              <div v-if="layer.filterable" class="control-group">
                <label>数据过滤:</label>
                <select @change="applyLayerFilter(layer.id, $event.target.value)" class="filter-select">
                  <option value="">显示全部</option>
                  <option v-for="filter in layer.filters" :key="filter.value" :value="filter.value">
                    {{ filter.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- 自定义图层 -->
        <div class="layer-category" v-if="customLayers.length > 0">
          <h4>自定义图层</h4>
          <div v-for="layer in customLayers" :key="layer.id" class="layer-item">
            <div class="layer-header">
              <label class="layer-checkbox">
                <input 
                  type="checkbox" 
                  :checked="layer.visible" 
                  @change="toggleLayer(layer.id)"
                >
                <span class="layer-name">{{ layer.name }}</span>
              </label>
              <div class="layer-actions">
                <button class="btn-icon" @click="editLayer(layer.id)" title="编辑图层">
                  <i class="icon-edit"></i>
                </button>
                <button class="btn-icon" @click="removeLayer(layer.id)" title="移除图层">
                  <i class="icon-delete"></i>
                </button>
              </div>
            </div>
            <div v-if="layer.visible" class="layer-controls">
              <div class="control-group">
                <label>透明度: {{ Math.round(layer.opacity * 100) }}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  :value="layer.opacity" 
                  @input="changeLayerOpacity(layer.id, $event.target.value)"
                  class="opacity-slider"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 测量工具面板 -->
    <div v-if="showMeasurement" class="measurement-panel">
      <div class="panel-header">
        <h3>测量工具</h3>
        <button class="btn-close" @click="closeMeasurement">×</button>
      </div>
      <div class="panel-content">
        <button class="btn-measure" @click="startDistanceMeasurement">
          <i class="icon-distance"></i> 距离测量
        </button>
        <button class="btn-measure" @click="startAreaMeasurement">
          <i class="icon-area"></i> 面积测量
        </button>
        <button class="btn-measure" @click="clearMeasurements">
          <i class="icon-clear"></i> 清除测量
        </button>
        <div v-if="measurementResult" class="measurement-result">
          <h4>测量结果</h4>
          <p>{{ measurementResult }}</p>
        </div>
      </div>
    </div>

    <!-- 分析工具面板 -->
    <div v-if="showAnalysis" class="analysis-panel">
      <div class="panel-header">
        <h3>空间分析</h3>
        <button class="btn-close" @click="showAnalysis = false">×</button>
      </div>
      <div class="panel-content">
        <div class="analysis-tool">
          <h4>缓冲区分析</h4>
          <input v-model="bufferDistance" type="number" placeholder="缓冲距离(米)">
          <button @click="createBuffer">创建缓冲区</button>
        </div>
        <div class="analysis-tool">
          <h4>空间查询</h4>
          <select v-model="queryLayer">
            <option value="">选择查询图层</option>
            <option v-for="layer in queryableLayers" :key="layer.id" :value="layer.id">
              {{ layer.name }}
            </option>
          </select>
          <button @click="spatialQuery">空间查询</button>
        </div>
        <div class="analysis-tool">
          <h4>统计报告</h4>
          <button @click="generateStatisticsReport" class="report-btn">
            <i class="icon-chart"></i> 生成报告
          </button>
          <button @click="exportAnalysisResults" class="export-btn">
            <i class="icon-export"></i> 导出结果
          </button>
        </div>
        
        <!-- 统计报告显示区域 -->
        <div v-if="statisticsReport" class="statistics-report">
          <h4>空间统计报告</h4>
          <div class="report-tabs">
            <button 
              v-for="tab in reportTabs" 
              :key="tab.id"
              @click="activeReportTab = tab.id"
              :class="['tab-btn', { active: activeReportTab === tab.id }]"
            >
              {{ tab.name }}
            </button>
          </div>
          
          <!-- 项目统计 -->
          <div v-if="activeReportTab === 'projects'" class="report-content">
            <div class="stats-grid">
              <div class="stat-card">
                <h5>项目总数</h5>
                <div class="stat-value">{{ statisticsReport.projects.total }}</div>
              </div>
              <div class="stat-card">
                <h5>进行中项目</h5>
                <div class="stat-value">{{ statisticsReport.projects.ongoing }}</div>
              </div>
              <div class="stat-card">
                <h5>已完成项目</h5>
                <div class="stat-value">{{ statisticsReport.projects.completed }}</div>
              </div>
              <div class="stat-card">
                <h5>总投资额</h5>
                <div class="stat-value">{{ formatCurrency(statisticsReport.projects.totalInvestment) }}</div>
              </div>
            </div>
          </div>
          
          <!-- 空间分布 -->
          <div v-if="activeReportTab === 'spatial'" class="report-content">
            <div class="spatial-stats">
              <div class="stat-item">
                <label>项目密度最高区域:</label>
                <span>{{ statisticsReport.spatial.highDensityArea }}</span>
              </div>
              <div class="stat-item">
                <label>平均项目间距:</label>
                <span>{{ statisticsReport.spatial.averageDistance }}米</span>
              </div>
              <div class="stat-item">
                <label>覆盖面积:</label>
                <span>{{ statisticsReport.spatial.coverageArea }}平方公里</span>
              </div>
            </div>
          </div>
          
          <!-- 时间趋势 -->
          <div v-if="activeReportTab === 'temporal'" class="report-content">
            <div class="temporal-stats">
              <div class="stat-item">
                <label>本年度新增项目:</label>
                <span>{{ statisticsReport.temporal.thisYearNew }}</span>
              </div>
              <div class="stat-item">
                <label>预计完成项目:</label>
                <span>{{ statisticsReport.temporal.expectedCompletion }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目位置查看器 -->
    <div v-if="showProjectViewer" class="project-viewer-panel">
      <div class="panel-header">
        <h3>项目分布</h3>
        <button class="btn-close" @click="showProjectViewer = false">×</button>
      </div>
      <ProjectLocationViewer 
        :map-view="view"
        @projects-loaded="onProjectsLoaded"
        @projects-filtered="onProjectsFiltered"
        @project-selected="onProjectSelected"
        @view-on-map="viewProjectOnMap"
        @view-details="viewProjectDetails"
      />
    </div>

    <!-- 加载指示器 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>地图加载中...</p>
    </div>
  </div>
</template>

<script>
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import Basemap from '@arcgis/core/Basemap'
import TileLayer from '@arcgis/core/layers/TileLayer'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer'
import Graphic from '@arcgis/core/Graphic'
import Point from '@arcgis/core/geometry/Point'
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine'
import DistanceMeasurement2D from '@arcgis/core/widgets/DistanceMeasurement2D'
import AreaMeasurement2D from '@arcgis/core/widgets/AreaMeasurement2D'
import Sketch from '@arcgis/core/widgets/Sketch'
import HeatmapRenderer from '@arcgis/core/renderers/HeatmapRenderer'
import { projectService } from '@/services/project.service'
import { getCategoryLabel } from '@/services/category.service'
import ProjectLocationViewer from '@/components/gis/ProjectLocationViewer.vue'

export default {
  name: 'MapExplorer',
  components: {
    ProjectLocationViewer
  },
  data() {
    return {
      map: null,
      view: null,
      loading: true,
      currentBasemap: 'streets',
      showLayerPanel: false,
      showMeasurement: false,
      showAnalysis: false,
      showProjectViewer: false,
      showHeatmap: false,
      measurementResult: null,
      bufferDistance: 1000,
      queryLayer: '',
      distanceMeasurement: null,
      areaMeasurement: null,
      graphicsLayer: null,
      projectsLayer: null,
      heatmapLayer: null,
      projects: [],
      selectedProject: null,
      projectStatistics: null,
      heatmapData: [],
      customLayers: [],
      statisticsReport: null,
      activeReportTab: 'projects',
      reportTabs: [
        { id: 'projects', name: '项目统计' },
        { id: 'spatial', name: '空间分布' },
        { id: 'temporal', name: '时间趋势' }
      ],
      layerDataSources: [
        { id: 'geojson', name: 'GeoJSON文件', type: 'file' },
        { id: 'shapefile', name: 'Shapefile', type: 'file' },
        { id: 'kml', name: 'KML文件', type: 'file' },
        { id: 'wms', name: 'WMS服务', type: 'service' },
        { id: 'wfs', name: 'WFS服务', type: 'service' },
        { id: 'arcgis', name: 'ArcGIS服务', type: 'service' }
      ],
      basemaps: [
        { id: 'streets', name: '街道地图' },
        { id: 'satellite', name: '卫星影像' },
        { id: 'hybrid', name: '影像标注' },
        { id: 'topo', name: '地形图' },
        { id: 'gray', name: '灰色底图' }
      ],
      baseLayers: [
        { id: 'administrative', name: '行政区划', visible: true, opacity: 0.7 },
        { id: 'transportation', name: '交通网络', visible: false, opacity: 0.8 },
        { id: 'poi', name: '兴趣点', visible: false, opacity: 0.9 }
      ],
      businessLayers: [
        { 
          id: 'projects', 
          name: '项目分布', 
          visible: true, 
          opacity: 0.8, 
          type: 'feature',
          symbolSize: 10,
          filterable: true,
          filters: [
            { value: 'notStarted', label: '未开始' },
            { value: 'inProgress', label: '进行中' },
            { value: 'completed', label: '已完成' },
            { value: 'delayed', label: '延期' }
          ]
        },
        { 
          id: 'population', 
          name: '人口密度', 
          visible: false, 
          opacity: 0.6,
          type: 'raster',
          filterable: false
        },
        { 
          id: 'economy', 
          name: '经济指标', 
          visible: false, 
          opacity: 0.7,
          type: 'feature',
          symbolSize: 8,
          filterable: true,
          filters: [
            { value: 'high', label: '高收入区' },
            { value: 'medium', label: '中等收入区' },
            { value: 'low', label: '低收入区' }
          ]
        }
      ],
      queryableLayers: [
        { id: 'projects', name: '项目数据' },
        { id: 'administrative', name: '行政区划' }
      ]
    }
  },
  async mounted() {
    await this.initMap()
    this.loading = false
    
    // 添加键盘事件监听器
    document.addEventListener('keydown', this.handleKeyboardShortcuts)
    
    // 初始化工具提示
    this.initTooltips()
  },
  beforeDestroy() {
    if (this.view) {
      this.view.destroy()
    }
    
    // 移除键盘事件监听器
    document.removeEventListener('keydown', this.handleKeyboardShortcuts)
  },
  methods: {
    async initMap() {
      try {
        // 创建地图
        this.map = new Map({
          basemap: 'streets-navigation-vector'
        })

        // 创建图形图层
        this.graphicsLayer = new GraphicsLayer({
          title: '绘制图层'
        })
        this.map.add(this.graphicsLayer)

        // 创建地图视图
        this.view = new MapView({
          container: this.$refs.mapContainer,
          map: this.map,
          center: [104.0668, 30.5728], // 成都坐标
          zoom: 11,
          constraints: {
            snapToZoom: false
          }
        })

        // 等待视图加载完成
        await this.view.when()

        // 加载业务图层
        await this.loadBusinessLayers()

        console.log('ArcGIS地图初始化完成')
      } catch (error) {
        console.error('地图初始化失败:', error)
        this.loading = false
      }
    },

    async loadBusinessLayers() {
      try {
        // 从服务获取项目地理数据
        const projectsGeoData = await projectService.getProjectsGeoData()
        
        // 创建项目图层
        const projectLayer = new GeoJSONLayer({
          source: projectsGeoData,
          title: '项目分布',
          visible: true,
          renderer: {
            type: 'unique-value',
            field: 'status',
            uniqueValueInfos: [
              {
                value: 'planning',
                symbol: {
                  type: 'simple-marker',
                  color: [255, 193, 7, 0.8],
                  size: 10,
                  outline: { color: [255, 193, 7, 1], width: 2 }
                },
                label: '规划中'
              },
              {
                value: 'ongoing',
                symbol: {
                  type: 'simple-marker',
                  color: [40, 167, 69, 0.8],
                  size: 12,
                  outline: { color: [40, 167, 69, 1], width: 2 }
                },
                label: '进行中'
              },
              {
                value: 'completed',
                symbol: {
                  type: 'simple-marker',
                  color: [0, 123, 255, 0.8],
                  size: 10,
                  outline: { color: [0, 123, 255, 1], width: 2 }
                },
                label: '已完成'
              },
              {
                value: 'paused',
                symbol: {
                  type: 'simple-marker',
                  color: [220, 53, 69, 0.8],
                  size: 8,
                  outline: { color: [220, 53, 69, 1], width: 2 }
                },
                label: '暂停'
              }
            ]
          },
          popupTemplate: {
            title: '{name}',
            content: `
              <div class="project-popup">
                <p><strong>类型:</strong> {type}</p>
                <p><strong>状态:</strong> {status}</p>
                <p><strong>投资:</strong> {investment} 万元</p>
                <p><strong>开始时间:</strong> {startDate}</p>
                <p><strong>结束时间:</strong> {endDate}</p>
                <p><strong>描述:</strong> {description}</p>
              </div>
            `
          }
        })

        this.map.add(projectLayer)
        this.projectsLayer = projectLayer
        
        // 转换数据格式供其他功能使用
        this.projects = projectsGeoData.features.map(feature => ({
          id: feature.properties.id,
          name: feature.properties.name,
          category: feature.properties.category,
          status: feature.properties.status,
          investment: feature.properties.investment,
          startDate: feature.properties.startDate,
          endDate: feature.properties.endDate,
          description: feature.properties.description,
          manager: feature.properties.manager,
          longitude: feature.geometry.coordinates[0],
          latitude: feature.geometry.coordinates[1]
        }))
        
        // 加载项目统计数据
        await this.loadProjectStatistics()
        
      } catch (error) {
        console.error('加载业务图层失败:', error)
      }
    },

    async loadProjectStatistics() {
      try {
        const statistics = await projectService.getProjectStatistics()
        this.projectStatistics = statistics
        console.log('项目统计数据:', statistics)
      } catch (error) {
        console.error('加载项目统计数据失败:', error)
      }
    },

    changeBasemap(basemapId) {
      this.currentBasemap = basemapId
      let basemapName = 'streets-navigation-vector'
      
      switch (basemapId) {
        case 'satellite':
          basemapName = 'satellite'
          break
        case 'hybrid':
          basemapName = 'hybrid'
          break
        case 'topo':
          basemapName = 'topo-vector'
          break
        case 'gray':
          basemapName = 'gray-vector'
          break
        default:
          basemapName = 'streets-navigation-vector'
      }
      
      this.map.basemap = basemapName
    },

    toggleLayerPanel() {
      this.showLayerPanel = !this.showLayerPanel
      this.showMeasurement = false
      this.showAnalysis = false
    },

    toggleMeasurement() {
      this.showMeasurement = !this.showMeasurement
      this.showLayerPanel = false
      this.showAnalysis = false
    },

    toggleAnalysis() {
      this.showAnalysis = !this.showAnalysis
      this.showLayerPanel = false
      this.showMeasurement = false
      this.showProjectViewer = false
    },

    toggleProjectViewer() {
      this.showProjectViewer = !this.showProjectViewer
      this.showLayerPanel = false
      this.showMeasurement = false
      this.showAnalysis = false
    },

    async toggleHeatmap() {
      this.showHeatmap = !this.showHeatmap
      if (this.showHeatmap) {
        this.showLayerPanel = false
        this.showMeasurement = false
        this.showAnalysis = false
        this.showProjectViewer = false
        await this.loadHeatmapData()
        this.showHeatmapLayer()
      } else {
        this.hideHeatmapLayer()
      }
    },

    async loadHeatmapData() {
      try {
        const heatmapData = await projectService.getHeatmapData('investment')
        this.heatmapData = heatmapData
      } catch (error) {
        console.error('加载热力图数据失败:', error)
      }
    },

    showHeatmapLayer() {
      if (this.heatmapLayer) {
        this.heatmapLayer.visible = true
        return
      }

      // 创建热力图数据点
      const heatmapFeatures = this.heatmapData.map(point => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [point.lng, point.lat]
        },
        properties: {
          intensity: point.intensity
        }
      }))

      const heatmapGeoJSON = {
        type: 'FeatureCollection',
        features: heatmapFeatures
      }

      // 创建热力图图层
      this.heatmapLayer = new GeoJSONLayer({
        source: heatmapGeoJSON,
        title: '投资热力图',
        renderer: new HeatmapRenderer({
          field: 'intensity',
          colorStops: [
            { color: [0, 0, 255, 0], ratio: 0 },
            { color: [0, 255, 255, 0.5], ratio: 0.2 },
            { color: [0, 255, 0, 0.7], ratio: 0.5 },
            { color: [255, 255, 0, 0.8], ratio: 0.8 },
            { color: [255, 0, 0, 1], ratio: 1 }
          ],
          radius: 20,
          maxPixelIntensity: 100,
          minPixelIntensity: 0
        })
      })

      this.map.add(this.heatmapLayer)
    },

    hideHeatmapLayer() {
      if (this.heatmapLayer) {
        this.heatmapLayer.visible = false
      }
    },

    toggleLayer(layerId) {
      // 切换图层可见性
      const layer = this.map.layers.find(l => l.title === layerId)
      if (layer) {
        layer.visible = !layer.visible
      }
      
      // 更新本地状态
      const baseLayer = this.baseLayers.find(l => l.id === layerId)
      if (baseLayer) {
        baseLayer.visible = !baseLayer.visible
      }
      
      const businessLayer = this.businessLayers.find(l => l.id === layerId)
      if (businessLayer) {
        businessLayer.visible = !businessLayer.visible
      }
    },

    changeLayerOpacity(layerId, opacity) {
      const layer = this.map.layers.find(l => l.title === layerId)
      if (layer) {
        layer.opacity = parseFloat(opacity)
      }
      
      // 更新本地状态
      const baseLayer = this.baseLayers.find(l => l.id === layerId)
      if (baseLayer) {
        baseLayer.opacity = parseFloat(opacity)
      }
      
      const businessLayer = this.businessLayers.find(l => l.id === layerId)
      if (businessLayer) {
        businessLayer.opacity = parseFloat(opacity)
      }
    },

    startDistanceMeasurement() {
      this.clearMeasurements()
      
      this.distanceMeasurement = new DistanceMeasurement2D({
        view: this.view
      })
      
      this.view.ui.add(this.distanceMeasurement, 'top-right')
      
      this.distanceMeasurement.viewModel.start()
    },

    startAreaMeasurement() {
      this.clearMeasurements()
      
      this.areaMeasurement = new AreaMeasurement2D({
        view: this.view
      })
      
      this.view.ui.add(this.areaMeasurement, 'top-right')
      
      this.areaMeasurement.viewModel.start()
    },

    clearMeasurements() {
      if (this.distanceMeasurement) {
        this.view.ui.remove(this.distanceMeasurement)
        this.distanceMeasurement.destroy()
        this.distanceMeasurement = null
      }
      
      if (this.areaMeasurement) {
        this.view.ui.remove(this.areaMeasurement)
        this.areaMeasurement.destroy()
        this.areaMeasurement = null
      }
      
      this.measurementResult = null
    },

    closeMeasurement() {
      this.showMeasurement = false
      this.clearMeasurements()
    },

    async createBuffer() {
      if (!this.view || !this.bufferDistance) {
        alert('请输入有效的缓冲距离')
        return
      }

      try {
        // 启动绘制工具让用户选择中心点
        const sketch = new Sketch({
          layer: this.graphicsLayer,
          view: this.view,
          creationMode: 'single',
          availableCreateTools: ['point']
        })

        this.view.ui.add(sketch, 'top-right')

        // 监听绘制完成事件
        sketch.on('create', async (event) => {
          if (event.state === 'complete') {
            const point = event.graphic.geometry
            await this.performBufferAnalysis(point)
            this.view.ui.remove(sketch)
            sketch.destroy()
          }
        })

      } catch (error) {
        console.error('缓冲区分析失败:', error)
        alert('缓冲区分析失败，请重试')
      }
    },

    async performBufferAnalysis(centerPoint) {
      try {
        // 创建缓冲区几何
        const bufferGeometry = geometryEngine.buffer(centerPoint, this.bufferDistance, 'meters')
        
        // 创建缓冲区图形
        const bufferGraphic = new Graphic({
          geometry: bufferGeometry,
          symbol: {
            type: 'simple-fill',
            color: [255, 0, 0, 0.2],
            outline: {
              color: [255, 0, 0, 0.8],
              width: 2
            }
          }
        })

        // 添加到地图
        this.graphicsLayer.add(bufferGraphic)

        // 查找缓冲区内的项目
        const projectsInBuffer = this.projects.filter(project => {
          if (!project.longitude || !project.latitude) return false
          
          const projectPoint = new Point({
            longitude: project.longitude,
            latitude: project.latitude
          })
          
          return geometryEngine.contains(bufferGeometry, projectPoint)
        })

        // 显示分析结果
        this.showBufferAnalysisResult(projectsInBuffer, this.bufferDistance)
        
        // 高亮缓冲区内的项目
        this.highlightProjectsInBuffer(projectsInBuffer)

      } catch (error) {
        console.error('缓冲区分析计算失败:', error)
        alert('缓冲区分析计算失败')
      }
    },

    showBufferAnalysisResult(projects, distance) {
      const resultContent = `
        <div class="buffer-analysis-result">
          <h4>缓冲区分析结果</h4>
          <p><strong>缓冲距离:</strong> ${distance} 米</p>
          <p><strong>影响项目数量:</strong> ${projects.length} 个</p>
          <div class="project-list">
            ${projects.map(p => `
              <div class="project-item">
                <strong>${p.name}</strong><br>
                <small>类型: ${this.getTypeText(p.type)} | 状态: ${this.getStatusText(p.status)}</small>
              </div>
            `).join('')}
          </div>
        </div>
      `
      
      // 创建信息窗口
      this.view.popup.open({
        title: '缓冲区分析',
        content: resultContent,
        location: this.view.center
      })
    },

    highlightProjectsInBuffer(projects) {
      // 清除之前的高亮
      this.clearHighlight()
      
      // 为缓冲区内的项目创建高亮效果
      projects.forEach(project => {
        if (project.longitude && project.latitude) {
          const point = new Point({
            longitude: project.longitude,
            latitude: project.latitude
          })
          
          const highlightGraphic = new Graphic({
            geometry: point,
            symbol: {
              type: 'simple-marker',
              color: [255, 255, 0, 0.9],
              size: 14,
              outline: {
                color: [255, 0, 0, 1],
                width: 3
              }
            }
          })
          
          this.graphicsLayer.add(highlightGraphic)
        }
      })
    },

    async spatialQuery() {
      if (!this.queryLayer) {
        alert('请选择查询图层')
        return
      }

      try {
        // 启动绘制工具让用户绘制查询区域
        const sketch = new Sketch({
          layer: this.graphicsLayer,
          view: this.view,
          creationMode: 'single',
          availableCreateTools: ['polygon', 'rectangle', 'circle']
        })

        this.view.ui.add(sketch, 'top-right')

        // 监听绘制完成事件
        sketch.on('create', async (event) => {
          if (event.state === 'complete') {
            const queryGeometry = event.graphic.geometry
            await this.performSpatialQuery(queryGeometry)
            this.view.ui.remove(sketch)
            sketch.destroy()
          }
        })

      } catch (error) {
        console.error('空间查询失败:', error)
        alert('空间查询失败，请重试')
      }
    },

    async performSpatialQuery(queryGeometry) {
      try {
        let queryResults = []
        
        if (this.queryLayer === 'projects') {
          // 查询项目数据
          queryResults = this.projects.filter(project => {
            if (!project.longitude || !project.latitude) return false
            
            const projectPoint = new Point({
              longitude: project.longitude,
              latitude: project.latitude
            })
            
            return geometryEngine.contains(queryGeometry, projectPoint) || 
                   geometryEngine.intersects(queryGeometry, projectPoint)
          })
        }

        // 显示查询结果
        this.showSpatialQueryResult(queryResults, this.queryLayer)
        
        // 高亮查询结果
        this.highlightQueryResults(queryResults)

      } catch (error) {
        console.error('空间查询计算失败:', error)
        alert('空间查询计算失败')
      }
    },

    showSpatialQueryResult(results, layerType) {
      const resultContent = `
        <div class="spatial-query-result">
          <h4>空间查询结果</h4>
          <p><strong>查询图层:</strong> ${layerType === 'projects' ? '项目数据' : '行政区划'}</p>
          <p><strong>查询结果数量:</strong> ${results.length} 个</p>
          <div class="result-list">
            ${results.map(item => `
              <div class="result-item">
                <strong>${item.name}</strong><br>
                <small>${layerType === 'projects' ? 
                  `分类: ${getCategoryLabel(item.category)} | 投资: ${item.investment}万元` : 
                  `区域信息`
                }</small>
              </div>
            `).join('')}
          </div>
        </div>
      `
      
      // 创建信息窗口
      this.view.popup.open({
        title: '空间查询',
        content: resultContent,
        location: this.view.center
      })
    },

    highlightQueryResults(results) {
      // 清除之前的高亮
      this.clearHighlight()
      
      // 为查询结果创建高亮效果
      results.forEach(item => {
        if (item.longitude && item.latitude) {
          const point = new Point({
            longitude: item.longitude,
            latitude: item.latitude
          })
          
          const highlightGraphic = new Graphic({
            geometry: point,
            symbol: {
              type: 'simple-marker',
              color: [0, 255, 255, 0.9],
              size: 16,
              outline: {
                color: [0, 0, 255, 1],
                width: 3
              }
            }
          })
          
          this.graphicsLayer.add(highlightGraphic)
        }
      })
    },

    getTypeText(type) {
      const typeMap = {
        infrastructure: '基础设施',
        residential: '住宅',
        commercial: '商业',
        industrial: '工业',
        public: '公共设施'
      }
      return typeMap[type] || type
    },

    getStatusText(status) {
      const statusMap = {
        planning: '规划中',
        ongoing: '进行中',
        completed: '已完成',
        paused: '暂停'
      }
      return statusMap[status] || status
    },

    // 项目数据处理方法
    onProjectsLoaded(projects) {
      this.projects = projects
      this.addProjectsToMap(projects)
    },

    onProjectsFiltered(filteredProjects) {
      this.clearProjectsFromMap()
      this.addProjectsToMap(filteredProjects)
    },

    onProjectSelected(project) {
      this.selectedProject = project
      this.highlightProject(project)
    },

    viewProjectOnMap(project) {
      if (this.view && project.longitude && project.latitude) {
        this.view.goTo({
          center: [project.longitude, project.latitude],
          zoom: 15
        })
        this.highlightProject(project)
      }
    },

    viewProjectDetails(project) {
      // 显示项目详情弹窗
      console.log('查看项目详情:', project)
      // 这里可以触发一个详情模态框
    },

    addProjectsToMap(projects) {
      if (!this.view || !projects.length) return

      // 清除现有项目图层
      this.clearProjectsFromMap()

      // 创建项目图形
      const projectGraphics = projects.map(project => {
        if (!project.longitude || !project.latitude) return null

        const point = new Point({
          longitude: project.longitude,
          latitude: project.latitude
        })

        const symbol = this.getProjectSymbol(project.status, project.category)
        
        return new Graphic({
          geometry: point,
          symbol: symbol,
          attributes: project,
          popupTemplate: {
            title: project.name,
            content: `
              <div class="project-popup">
                <p><strong>项目分类:</strong> ${project.category ? getCategoryLabel(project.category) : '未分类'}</p>
                <p><strong>项目状态:</strong> ${this.getStatusText(project.status)}</p>
                <p><strong>负责人:</strong> ${project.manager}</p>
                <p><strong>投资金额:</strong> ${project.investment} 万元</p>
                <p><strong>项目地址:</strong> ${project.address}</p>
                <p><strong>开始日期:</strong> ${project.startDate}</p>
                <p><strong>结束日期:</strong> ${project.endDate}</p>
                <p><strong>项目描述:</strong> ${project.description || '暂无描述'}</p>
              </div>
            `
          }
        })
      }).filter(graphic => graphic !== null)

      // 添加到图形图层
      this.graphicsLayer.addMany(projectGraphics)
    },

    clearProjectsFromMap() {
      if (this.graphicsLayer) {
        this.graphicsLayer.removeAll()
      }
    },

    highlightProject(project) {
      if (!this.view || !project.longitude || !project.latitude) return

      // 创建高亮图形
      const point = new Point({
        longitude: project.longitude,
        latitude: project.latitude
      })

      const highlightSymbol = {
        type: 'simple-marker',
        color: [255, 255, 0, 0.8],
        size: 16,
        outline: {
          color: [255, 0, 0, 1],
          width: 3
        }
      }

      const highlightGraphic = new Graphic({
        geometry: point,
        symbol: highlightSymbol
      })

      // 清除之前的高亮
      this.clearHighlight()
      
      // 添加高亮图形
      this.graphicsLayer.add(highlightGraphic)
      
      // 保存高亮图形引用
      this.highlightGraphic = highlightGraphic
    },

    getStatusText(status) {
      const statusMap = {
        notStarted: '未开始',
        inProgress: '进行中',
        completed: '已完成',
        delayed: '延期'
      }
      return statusMap[status] || '未知状态'
    },

    clearHighlight() {
      if (this.highlightGraphic) {
        this.graphicsLayer.remove(this.highlightGraphic)
        this.highlightGraphic = null
      }
    },

    getProjectSymbol(status, category) {
      // 根据项目状态和分类返回不同的符号
      const statusColors = {
        notStarted: [255, 193, 7, 0.8],    // 黄色 - 未开始
        inProgress: [40, 167, 69, 0.8],    // 绿色 - 进行中
        completed: [23, 162, 184, 0.8],    // 蓝色 - 已完成
        delayed: [220, 53, 69, 0.8]        // 红色 - 延期
      }

      // 根据项目分类定义不同的图标样式和颜色
      const categoryStyles = {
        SMART_CITY: {
          color: [29, 78, 216, 0.8],    // 蓝色
          style: 'diamond',
          size: 14
        },
        TRANSPORTATION: {
          color: [22, 163, 74, 0.8],    // 绿色
          style: 'square',
          size: 12
        },
        ENVIRONMENTAL: {
          color: [217, 119, 6, 0.8],    // 橙色
          style: 'circle',
          size: 13
        },
        PUBLIC_FACILITIES: {
          color: [220, 38, 38, 0.8],    // 红色
          style: 'triangle',
          size: 14
        },
        WATER_SUPPLY_DRAINAGE: {
          color: [67, 56, 202, 0.8],    // 紫色
          style: 'cross',
          size: 12
        },
        MUNICIPAL: {
          color: [124, 58, 237, 0.8],   // 紫罗兰色
          style: 'x',
          size: 13
        },
        HYDRAULIC: {
          color: [8, 145, 178, 0.8],    // 青色
          style: 'circle',
          size: 12
        }
      }

      const categoryStyle = categoryStyles[category] || {
        color: [128, 128, 128, 0.8],
        style: 'circle',
        size: 10
      }

      // 如果有状态信息，使用状态颜色，否则使用分类颜色
      const finalColor = status && statusColors[status] ? statusColors[status] : categoryStyle.color

      return {
        type: 'simple-marker',
        color: finalColor,
        size: categoryStyle.size,
        style: categoryStyle.style,
        outline: {
          color: [255, 255, 255, 1],
          width: 2
        }
      }
    },

    // 图层管理增强功能
    addCustomLayer() {
      // 显示添加图层对话框
      this.showAddLayerDialog()
    },

    showAddLayerDialog() {
      // 创建添加图层的模态对话框
      const dialog = document.createElement('div')
      dialog.className = 'layer-dialog-overlay'
      dialog.innerHTML = `
        <div class="layer-dialog">
          <div class="dialog-header">
            <h3>添加图层</h3>
            <button class="btn-close" onclick="this.closest('.layer-dialog-overlay').remove()">×</button>
          </div>
          <div class="dialog-content">
            <div class="form-group">
              <label>数据源类型:</label>
              <select id="dataSourceType">
                ${this.layerDataSources.map(ds => 
                  `<option value="${ds.id}">${ds.name}</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>图层名称:</label>
              <input type="text" id="layerName" placeholder="输入图层名称">
            </div>
            <div class="form-group" id="fileInput" style="display: none;">
              <label>选择文件:</label>
              <input type="file" id="layerFile" accept=".geojson,.json,.kml,.shp">
            </div>
            <div class="form-group" id="serviceInput" style="display: none;">
              <label>服务URL:</label>
              <input type="url" id="serviceUrl" placeholder="输入服务地址">
            </div>
          </div>
          <div class="dialog-footer">
            <button class="btn-cancel" onclick="this.closest('.layer-dialog-overlay').remove()">取消</button>
            <button class="btn-confirm" onclick="window.mapExplorer.confirmAddLayer()">确定</button>
          </div>
        </div>
      `
      
      document.body.appendChild(dialog)
      
      // 绑定数据源类型变化事件
      const typeSelect = dialog.querySelector('#dataSourceType')
      const fileInput = dialog.querySelector('#fileInput')
      const serviceInput = dialog.querySelector('#serviceInput')
      
      typeSelect.addEventListener('change', (e) => {
        const selectedType = this.layerDataSources.find(ds => ds.id === e.target.value)
        if (selectedType.type === 'file') {
          fileInput.style.display = 'block'
          serviceInput.style.display = 'none'
        } else {
          fileInput.style.display = 'none'
          serviceInput.style.display = 'block'
        }
      })
      
      // 触发初始状态
      typeSelect.dispatchEvent(new Event('change'))
      
      // 保存对话框引用供确认使用
      window.mapExplorer = this
    },

    async confirmAddLayer() {
      const dialog = document.querySelector('.layer-dialog-overlay')
      const dataSourceType = dialog.querySelector('#dataSourceType').value
      const layerName = dialog.querySelector('#layerName').value
      const layerFile = dialog.querySelector('#layerFile').files[0]
      const serviceUrl = dialog.querySelector('#serviceUrl').value
      
      if (!layerName) {
        alert('请输入图层名称')
        return
      }
      
      try {
        let layer = null
        const selectedDataSource = this.layerDataSources.find(ds => ds.id === dataSourceType)
        
        if (selectedDataSource.type === 'file') {
          if (!layerFile) {
            alert('请选择文件')
            return
          }
          layer = await this.createLayerFromFile(layerFile, layerName, dataSourceType)
        } else {
          if (!serviceUrl) {
            alert('请输入服务地址')
            return
          }
          layer = await this.createLayerFromService(serviceUrl, layerName, dataSourceType)
        }
        
        if (layer) {
          // 添加到地图
          this.map.add(layer)
          
          // 添加到自定义图层列表
          this.customLayers.push({
            id: `custom_${Date.now()}`,
            name: layerName,
            visible: true,
            opacity: 0.8,
            type: 'custom',
            layer: layer
          })
          
          // 关闭对话框
          dialog.remove()
          
          console.log('图层添加成功:', layerName)
        }
      } catch (error) {
        console.error('添加图层失败:', error)
        alert('添加图层失败: ' + error.message)
      }
    },

    async createLayerFromFile(file, name, type) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            let layer = null
            const content = e.target.result
            
            switch (type) {
              case 'geojson':
                const geoJsonData = JSON.parse(content)
                layer = new GeoJSONLayer({
                  source: geoJsonData,
                  title: name
                })
                break
              case 'kml':
                // KML处理逻辑
                layer = new GeoJSONLayer({
                  source: this.convertKmlToGeoJson(content),
                  title: name
                })
                break
              default:
                throw new Error('不支持的文件类型')
            }
            
            resolve(layer)
          } catch (error) {
            reject(error)
          }
        }
        
        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsText(file)
      })
    },

    async createLayerFromService(url, name, type) {
      try {
        let layer = null
        
        switch (type) {
          case 'wms':
            layer = new TileLayer({
              url: url,
              title: name
            })
            break
          case 'wfs':
            layer = new FeatureLayer({
              url: url,
              title: name
            })
            break
          case 'arcgis':
            layer = new FeatureLayer({
              url: url,
              title: name
            })
            break
          default:
            throw new Error('不支持的服务类型')
        }
        
        return layer
      } catch (error) {
        throw new Error('创建服务图层失败: ' + error.message)
      }
    },

    convertKmlToGeoJson(kmlContent) {
      // 简单的KML到GeoJSON转换
      // 实际项目中建议使用专门的转换库
      console.warn('KML转换功能需要完善实现')
      return {
        type: 'FeatureCollection',
        features: []
      }
    },

    importLayerData() {
      // 批量导入图层数据
      const input = document.createElement('input')
      input.type = 'file'
      input.multiple = true
      input.accept = '.geojson,.json,.kml,.shp'
      
      input.onchange = async (e) => {
        const files = Array.from(e.target.files)
        for (const file of files) {
          try {
            const layer = await this.createLayerFromFile(file, file.name.split('.')[0], 'geojson')
            this.map.add(layer)
            this.customLayers.push({
              id: `import_${Date.now()}_${Math.random()}`,
              name: file.name.split('.')[0],
              visible: true,
              opacity: 0.8,
              type: 'imported',
              layer: layer
            })
          } catch (error) {
            console.error(`导入文件 ${file.name} 失败:`, error)
          }
        }
      }
      
      input.click()
    },

    exportLayerData() {
      // 导出图层数据
      if (this.customLayers.length === 0) {
        alert('没有可导出的自定义图层')
        return
      }
      
      // 创建导出选择对话框
      const dialog = document.createElement('div')
      dialog.className = 'layer-dialog-overlay'
      dialog.innerHTML = `
        <div class="layer-dialog">
          <div class="dialog-header">
            <h3>导出图层数据</h3>
            <button class="btn-close" onclick="this.remove()">×</button>
          </div>
          <div class="dialog-content">
            <div class="export-layers">
              ${this.customLayers.map(layer => `
                <label class="export-layer-item">
                  <input type="checkbox" value="${layer.id}" checked>
                  ${layer.name}
                </label>
              `).join('')}
            </div>
            <div class="form-group">
              <label>导出格式:</label>
              <select id="exportFormat">
                <option value="geojson">GeoJSON</option>
                <option value="kml">KML</option>
              </select>
            </div>
          </div>
          <div class="dialog-footer">
            <button class="btn-cancel" onclick="this.closest('.layer-dialog-overlay').remove()">取消</button>
            <button class="btn-confirm" onclick="window.mapExplorer.confirmExportLayers()">导出</button>
          </div>
        </div>
      `
      
      document.body.appendChild(dialog)
    },

    confirmExportLayers() {
      const dialog = document.querySelector('.layer-dialog-overlay')
      const selectedLayers = Array.from(dialog.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value)
      const format = dialog.querySelector('#exportFormat').value
      
      selectedLayers.forEach(layerId => {
        const layer = this.customLayers.find(l => l.id === layerId)
        if (layer) {
          this.downloadLayerData(layer, format)
        }
      })
      
      dialog.remove()
    },

    downloadLayerData(layer, format) {
      // 简化的数据导出功能
      const data = {
        type: 'FeatureCollection',
        features: [] // 实际应该从图层获取要素数据
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${layer.name}.${format}`
      a.click()
      
      URL.revokeObjectURL(url)
    },

    zoomToLayer(layerId) {
      // 缩放到图层范围
      const layer = this.map.layers.find(l => l.title === layerId || l.id === layerId)
      if (layer && this.view) {
        this.view.goTo(layer.fullExtent).catch(error => {
          console.warn('无法缩放到图层范围:', error)
        })
      }
    },

    showLayerInfo(layerId) {
      // 显示图层信息
      const layer = this.map.layers.find(l => l.title === layerId || l.id === layerId)
      if (layer) {
        const info = {
          名称: layer.title || '未命名',
          类型: layer.type || '未知',
          可见性: layer.visible ? '可见' : '隐藏',
          透明度: Math.round(layer.opacity * 100) + '%'
        }
        
        const infoText = Object.entries(info)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
        
        alert(`图层信息:\n\n${infoText}`)
      }
    },

    removeLayer(layerId) {
      if (confirm('确定要移除这个图层吗？')) {
        // 从地图移除
        const layer = this.map.layers.find(l => l.title === layerId || l.id === layerId)
        if (layer) {
          this.map.remove(layer)
        }
        
        // 从自定义图层列表移除
        this.customLayers = this.customLayers.filter(l => l.id !== layerId)
        
        // 从业务图层列表移除（如果是可移除的）
        this.businessLayers = this.businessLayers.filter(l => l.id !== layerId)
      }
    },

    editLayer(layerId) {
      // 编辑图层属性
      const layer = this.customLayers.find(l => l.id === layerId)
      if (layer) {
        const newName = prompt('请输入新的图层名称:', layer.name)
        if (newName && newName !== layer.name) {
          layer.name = newName
          if (layer.layer) {
            layer.layer.title = newName
          }
        }
      }
    },

    changeSymbolSize(layerId, size) {
      // 改变符号大小
      const layer = this.businessLayers.find(l => l.id === layerId)
      if (layer) {
        layer.symbolSize = parseInt(size)
        
        // 更新地图图层的渲染器
        const mapLayer = this.map.layers.find(l => l.title === layerId)
        if (mapLayer && mapLayer.renderer) {
          // 更新渲染器的符号大小
          this.updateLayerSymbolSize(mapLayer, size)
        }
      }
    },

    updateLayerSymbolSize(mapLayer, size) {
      // 更新图层符号大小的具体实现
      if (mapLayer.renderer && mapLayer.renderer.symbol) {
        mapLayer.renderer.symbol.size = parseInt(size)
      } else if (mapLayer.renderer && mapLayer.renderer.uniqueValueInfos) {
        mapLayer.renderer.uniqueValueInfos.forEach(info => {
          if (info.symbol) {
            info.symbol.size = parseInt(size)
          }
        })
      }
    },

    applyLayerFilter(layerId, filterValue) {
       // 应用图层过滤
       const mapLayer = this.map.layers.find(l => l.title === layerId)
       if (mapLayer) {
         if (filterValue) {
           // 应用过滤条件
           mapLayer.definitionExpression = `status = '${filterValue}'`
         } else {
           // 清除过滤
           mapLayer.definitionExpression = null
         }
       }
     },

     // 统计报告功能
     async generateStatisticsReport() {
       try {
         // 获取项目统计数据
         const projectStats = await projectService.getProjectStatistics()
         
         // 计算空间分布统计
         const spatialStats = await this.calculateSpatialStatistics()
         
         // 计算时间趋势统计
         const temporalStats = await this.calculateTemporalStatistics()
         
         this.statisticsReport = {
           projects: {
             total: projectStats.total || 0,
             ongoing: projectStats.ongoing || 0,
             completed: projectStats.completed || 0,
             paused: projectStats.paused || 0,
             planning: projectStats.planning || 0,
             totalInvestment: projectStats.totalInvestment || 0
           },
           spatial: {
             highDensityArea: spatialStats.highDensityArea || '市中心区域',
             averageDistance: spatialStats.averageDistance || 1200,
             coverageArea: spatialStats.coverageArea || 156.8,
             clusteredProjects: spatialStats.clusteredProjects || 0
           },
           temporal: {
             thisYearNew: temporalStats.thisYearNew || 0,
             expectedCompletion: temporalStats.expectedCompletion || 0,
             monthlyTrend: temporalStats.monthlyTrend || [],
             averageProjectDuration: temporalStats.averageProjectDuration || 18
           },
           generatedAt: new Date().toLocaleString()
         }
         
         console.log('统计报告生成成功:', this.statisticsReport)
       } catch (error) {
         console.error('生成统计报告失败:', error)
         alert('生成统计报告失败，请稍后重试')
       }
     },

     async calculateSpatialStatistics() {
       // 计算空间分布统计
       if (!this.projects || this.projects.length === 0) {
         return {
           highDensityArea: '暂无数据',
           averageDistance: 0,
           coverageArea: 0,
           clusteredProjects: 0
         }
       }

       // 简化的空间统计计算
       const totalProjects = this.projects.length
       const estimatedCoverageArea = totalProjects * 2.5 // 假设每个项目覆盖2.5平方公里
       const averageDistance = Math.sqrt(estimatedCoverageArea / totalProjects) * 1000 // 转换为米

       return {
         highDensityArea: '城市核心区',
         averageDistance: Math.round(averageDistance),
         coverageArea: Math.round(estimatedCoverageArea * 10) / 10,
         clusteredProjects: Math.floor(totalProjects * 0.6)
       }
     },

     async calculateTemporalStatistics() {
       // 计算时间趋势统计
       const currentYear = new Date().getFullYear()
       const thisYearProjects = this.projects.filter(p => {
         const projectYear = new Date(p.createdAt || Date.now()).getFullYear()
         return projectYear === currentYear
       })

       const ongoingProjects = this.projects.filter(p => p.status === 'ongoing')
       const expectedCompletion = Math.floor(ongoingProjects.length * 0.7)

       return {
         thisYearNew: thisYearProjects.length,
         expectedCompletion: expectedCompletion,
         monthlyTrend: this.generateMonthlyTrend(),
         averageProjectDuration: 18
       }
     },

     generateMonthlyTrend() {
       // 生成月度趋势数据（模拟数据）
       const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
       return months.map(month => ({
         month,
         newProjects: Math.floor(Math.random() * 10) + 1,
         completedProjects: Math.floor(Math.random() * 8) + 1
       }))
     },

     exportAnalysisResults() {
       if (!this.statisticsReport) {
         alert('请先生成统计报告')
         return
       }

       // 创建导出数据
       const exportData = {
         title: '空间分析统计报告',
         generatedAt: this.statisticsReport.generatedAt,
         summary: {
           totalProjects: this.statisticsReport.projects.total,
           ongoingProjects: this.statisticsReport.projects.ongoing,
           completedProjects: this.statisticsReport.projects.completed,
           totalInvestment: this.statisticsReport.projects.totalInvestment
         },
         spatialAnalysis: this.statisticsReport.spatial,
         temporalAnalysis: this.statisticsReport.temporal,
         projectDetails: this.projects.map(p => ({
           id: p.id,
           name: p.name,
           status: p.status,
           type: p.type,
           investment: p.investment,
           location: {
             longitude: p.longitude,
             latitude: p.latitude
           }
         }))
       }

       // 导出为JSON文件
       const blob = new Blob([JSON.stringify(exportData, null, 2)], {
         type: 'application/json'
       })
       
       const url = URL.createObjectURL(blob)
       const a = document.createElement('a')
       a.href = url
       a.download = `空间分析报告_${new Date().toISOString().split('T')[0]}.json`
       a.click()
       
       URL.revokeObjectURL(url)
       
       console.log('分析结果导出成功')
     },

     formatCurrency(amount) {
       if (!amount) return '¥0'
       return `¥${(amount / 10000).toFixed(1)}万`
     },

     // 地图点击事件处理
     onMapClick(event) {
       if (this.measurementMode === 'distance' || this.measurementMode === 'area') {
         this.addMeasurementPoint(event.mapPoint);
       } else if (this.showAnalysis && this.analysisMode === 'buffer') {
         this.bufferCenter = event.mapPoint;
         this.performBufferAnalysis();
       } else {
         // 显示点击位置信息
         this.showLocationInfo(event.mapPoint);
       }
     },

     // 显示位置信息
     showLocationInfo(point) {
       const popup = {
         title: '位置信息',
         location: point,
         content: `
           <div class="location-info">
             <p><strong>经度:</strong> ${point.longitude.toFixed(6)}</p>
             <p><strong>纬度:</strong> ${point.latitude.toFixed(6)}</p>
             <p><strong>坐标系:</strong> WGS84</p>
           </div>
         `
       };
       if (this.mapView && this.mapView.popup) {
         this.mapView.popup.open(popup);
       }
     },

     // 键盘快捷键处理
     handleKeyboardShortcuts(event) {
       if (event.ctrlKey || event.metaKey) {
         switch (event.key) {
           case 'l':
             event.preventDefault();
             this.toggleLayerPanel();
             break;
           case 'm':
             event.preventDefault();
             this.toggleMeasurement();
             break;
           case 'a':
             event.preventDefault();
             this.toggleAnalysis();
             break;
           case 'p':
             event.preventDefault();
             this.toggleProjectViewer();
             break;
           case 'h':
             event.preventDefault();
             this.toggleHeatmap();
             break;
         }
       } else if (event.key === 'Escape') {
         this.closeAllPanels();
       }
     },

     // 关闭所有面板
     closeAllPanels() {
       this.showLayers = false;
       this.showMeasurement = false;
       this.showAnalysis = false;
       this.showProjectViewer = false;
       this.showHeatmap = false;
     },

     // 添加工具提示初始化
     initTooltips() {
       // 为工具按钮添加更详细的提示信息
       const tooltipData = {
         layers: '图层管理 (Ctrl+L)\n管理地图图层，添加、删除和配置图层属性',
         measurement: '测量工具 (Ctrl+M)\n测量距离、面积和周长',
         analysis: '空间分析 (Ctrl+A)\n执行缓冲区分析、空间查询和统计报告',
         projects: '项目管理 (Ctrl+P)\n查看和管理项目信息',
         heatmap: '热力图 (Ctrl+H)\n显示项目分布热力图'
       };
       
       // 可以在这里添加更复杂的工具提示逻辑
       console.log('工具提示已初始化', tooltipData);
     }
  }
}
</script>

<style scoped>
.map-explorer {
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.map-toolbar {
  height: 60px;
  background: #2c3e50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toolbar-left h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.toolbar-right {
  display: flex;
  gap: 20px;
}

.tool-group {
  display: flex;
  gap: 8px;
}

.btn-basemap,
.btn-tool {
  padding: 10px 16px;
  background: rgba(255,255,255,0.95);
  border: 1px solid #e1e8ed;
  color: #2c3e50;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-weight: 500;
}

.btn-tool::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: left 0.5s ease;
}

.btn-basemap:hover,
.btn-tool:hover {
  background: rgba(52, 152, 219, 0.1);
  border-color: #3498db;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.btn-tool:hover::before {
  left: 100%;
}

.btn-basemap.active {
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-color: #2980b9;
  color: white;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-tool.active {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border-color: #2980b9;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-tool.active:hover {
  background: linear-gradient(135deg, #2980b9, #21618c);
  transform: translateY(-1px);
}

.btn-text {
  font-weight: 500;
  white-space: nowrap;
}

.map-container {
  flex: 1;
  width: 100%;
  position: relative;
}

.layer-panel,
.measurement-panel,
.analysis-panel {
  position: absolute;
  top: 80px;
  right: 20px;
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.project-viewer-panel {
  position: absolute;
  top: 80px;
  left: 20px;
  width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  max-height: calc(100vh - 120px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #e74c3c;
}

.panel-content {
  padding: 20px;
}

.layer-category {
  margin-bottom: 20px;
}

.layer-category h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #34495e;
  font-weight: 600;
}

.layer-item {
  margin-bottom: 12px;
}

.layer-item label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #2c3e50;
  cursor: pointer;
}

/* 图层管理工具栏样式 */
.layer-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.btn-small {
  padding: 6px 12px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-small:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.btn-small i {
  font-size: 12px;
}

/* 图层项样式增强 */
.layer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.layer-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #2c3e50;
  cursor: pointer;
  flex: 1;
}

.layer-name {
  font-weight: 500;
}

.layer-actions {
  display: flex;
  gap: 4px;
}

.btn-icon {
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  font-size: 12px;
  color: #6c757d;
}

.btn-icon:hover {
  background: #f8f9fa;
  color: #495057;
}

.layer-controls {
  margin-left: 20px;
  padding: 8px 0;
  border-left: 2px solid #e9ecef;
  padding-left: 12px;
}

.control-group {
  margin-bottom: 12px;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-group label {
  display: block;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
  font-weight: 500;
}

.opacity-slider,
.size-slider {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #dee2e6;
  outline: none;
  cursor: pointer;
}

.opacity-slider::-webkit-slider-thumb,
.size-slider::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3498db;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.filter-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 12px;
  background: white;
}

/* 图层对话框样式 */
.layer-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.layer-dialog {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.dialog-header {
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.dialog-content {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #495057;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.dialog-footer {
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel,
.btn-confirm {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-confirm {
  background: #3498db;
  color: white;
}

.btn-confirm:hover {
  background: #2980b9;
}

.export-layers {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
}

.export-layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
  cursor: pointer;
}

.export-layer-item:hover {
  background: #f8f9fa;
  margin: 0 -8px;
  padding-left: 8px;
  padding-right: 8px;
  border-radius: 4px;
}

.btn-measure {
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s ease;
}

.btn-measure:hover {
  background: #2980b9;
}

.measurement-result {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #3498db;
}

.measurement-result h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #2c3e50;
}

.measurement-result p {
  margin: 0;
  font-size: 12px;
  color: #7f8c8d;
}

.analysis-tool {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.analysis-tool:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.analysis-tool h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #2c3e50;
}

.analysis-tool input,
.analysis-tool select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 13px;
}

.analysis-tool button {
  width: 100%;
  padding: 10px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s ease;
}

.analysis-tool button:hover {
  background: #229954;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
}

/* 分析结果样式 */
.buffer-analysis-result,
.spatial-query-result {
  max-width: 400px;
}

.buffer-analysis-result h4,
.spatial-query-result h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.buffer-analysis-result p,
.spatial-query-result p {
  margin: 8px 0;
  color: #34495e;
  font-size: 14px;
}

.project-list,
.result-list {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 15px;
}

.project-item,
.result-item {
  padding: 10px;
  margin: 8px 0;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #3498db;
}

.project-item strong,
.result-item strong {
  color: #2c3e50;
  font-size: 14px;
}

.project-item small,
.result-item small {
  color: #7f8c8d;
  font-size: 12px;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .layer-panel,
  .measurement-panel,
  .analysis-panel {
    width: 350px;
  }
  
  .project-viewer-panel {
    width: 350px;
  }
}

@media (max-width: 768px) {
  .map-toolbar {
    height: auto;
    flex-direction: column;
    padding: 12px;
    gap: 12px;
    background: linear-gradient(135deg, #2c3e50, #34495e);
  }
  
  .toolbar-left h2 {
    font-size: 18px;
    text-align: center;
  }
  
  .toolbar-right {
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  
  .tool-group {
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .btn-tool .btn-text {
    display: none;
  }
  
  .btn-tool {
    padding: 12px;
    min-width: 48px;
    justify-content: center;
  }
  
  .layer-panel,
  .measurement-panel,
  .analysis-panel {
    top: 140px;
    right: 10px;
    left: 10px;
    width: auto;
    max-height: calc(100vh - 160px);
    overflow-y: auto;
  }
  
  .project-viewer-panel {
    top: 140px;
    left: 10px;
    right: 10px;
    width: auto;
    max-height: calc(100vh - 160px);
    overflow-y: auto;
  }
  
  .buffer-analysis-result,
  .spatial-query-result {
    max-width: 100%;
  }
  
  .project-list,
  .result-list {
    max-height: 120px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .report-tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    font-size: 12px;
    padding: 6px 12px;
  }
}

@media (max-width: 480px) {
  .map-toolbar {
    padding: 8px;
  }
  
  .toolbar-left h2 {
    font-size: 16px;
  }
  
  .btn-tool {
    padding: 10px;
    min-width: 44px;
  }
  
  .layer-panel,
  .measurement-panel,
  .analysis-panel,
  .project-viewer-panel {
    top: 120px;
    right: 5px;
    left: 5px;
    padding: 12px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 12px;
  }
  
  .dialog {
     margin: 10px;
     width: calc(100% - 20px);
   }
 }

/* 位置信息弹窗样式 */
.location-info {
  padding: 12px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.location-info p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.4;
}

.location-info strong {
  color: #2c3e50;
  font-weight: 600;
}

/* 工具提示增强 */
.btn-tool[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
}

.btn-tool[title]:hover::before {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-bottom-color: rgba(0, 0, 0, 0.8);
  z-index: 1001;
  pointer-events: none;
}

/* 快捷键提示 */
.keyboard-shortcuts {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 12px;
  color: #666;
  z-index: 1000;
  transition: opacity 0.3s ease;
}

.keyboard-shortcuts.hidden {
  opacity: 0;
  pointer-events: none;
}

.keyboard-shortcuts h5 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 13px;
}

.keyboard-shortcuts ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.keyboard-shortcuts li {
  margin: 4px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.keyboard-shortcuts .key {
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 11px;
}
</style>

/* 图标样式 */
.icon-layers::before { content: '🗂️'; }
.icon-measure::before { content: '📏'; }
.icon-analysis::before { content: '📊'; }
.icon-projects::before { content: '🏗️'; }
.icon-heatmap::before { content: '🔥'; }
.icon-add::before { content: '➕'; }
.icon-import::before { content: '📥'; }
.icon-export::before { content: '📤'; }
.icon-zoom::before { content: '🔍'; }
.icon-info::before { content: 'ℹ️'; }
.icon-edit::before { content: '✏️'; }
.icon-delete::before { content: '🗑️'; }
.btn-close::before { content: '✖️'; }
.icon-chart::before { content: '📊'; }

/* 统计报告样式 */
.statistics-report {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.statistics-report h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.report-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 1px solid #dee2e6;
}

.tab-btn {
  padding: 8px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 13px;
  color: #6c757d;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #495057;
  background: #f8f9fa;
}

.tab-btn.active {
  color: #3498db;
  border-bottom-color: #3498db;
  font-weight: 500;
}

.report-content {
  min-height: 200px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-card h5 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.spatial-stats,
.temporal-stats {
  background: white;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-item label {
  font-size: 13px;
  color: #495057;
  font-weight: 500;
}

.stat-item span {
  font-size: 13px;
  color: #2c3e50;
  font-weight: 600;
}

.report-btn,
.export-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 8px;
  margin-bottom: 8px;
}

.report-btn {
  background: #3498db;
  color: white;
}

.report-btn:hover {
  background: #2980b9;
}

.export-btn {
  background: #27ae60;
  color: white;
}

.export-btn:hover {
  background: #229954;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .report-tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>
