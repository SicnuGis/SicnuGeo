<template>
  <div class="project-location-viewer">
    <div ref="cesiumContainer" class="cesium-container"></div>
    
    <!-- 项目信息浮层 -->
    <div v-if="selectedProject" class="project-info-overlay glass-effect">
      <h3>{{ selectedProject.name }}</h3>
      <p class="info-row">
        <span class="label">状态:</span>
        <span :class="['status-badge', selectedProject.status]">
          {{ getStatusText(selectedProject.status) }}
        </span>
      </p>
      <p class="info-row">
        <span class="label">位置:</span>
        <span>{{ selectedProject.address || '暂无地址信息' }}</span>
      </p>
    </div>
  </div>
</template>

<script>
// import * as Cesium from 'cesium';
// import 'cesium/Build/Cesium/Widgets/widgets.css';

export default {
  name: 'ProjectLocationViewer',
  props: {
    projects: {
      type: Array,
      default: () => []
    },
    initialCenter: {
      type: Array,
      default: () => [104.0668, 30.5728] // Default to Chengdu
    }
  },
  data() {
    return {
      viewer: null,
      entities: [],
      selectedProject: null
    };
  },
  watch: {
    projects: {
      handler(newProjects) {
        this.updateMarkers(newProjects);
      },
      deep: true
    },
    initialCenter: {
      handler(newCenter) {
        if (this.viewer && newCenter) {
          this.flyToLocation(newCenter);
        }
      }
    }
  },
  mounted() {
    this.initCesium();
  },
  beforeDestroy() {
    if (this.viewer) {
      this.viewer.destroy();
    }
  },
  methods: {
    initCesium() {
      // Initialize Cesium Viewer
      const Cesium = window.Cesium;
      this.viewer = new Cesium.Viewer(this.$refs.cesiumContainer, {
        animation: false,
        timeline: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        navigationHelpButton: false,
        baseLayerPicker: false,
        imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        })
      });

      // Hide credit
      this.viewer._cesiumWidget._creditContainer.style.display = 'none';

      // Initial fly to
      this.flyToLocation(this.initialCenter);

      // Add markers if projects exist
      if (this.projects.length > 0) {
        this.updateMarkers(this.projects);
      }
    },
    flyToLocation(center) {
      if (!center || center.length < 2) return;
      
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(center[0], center[1], 2000), // Height 2000m
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-45.0), // Look down at 45 degrees
          roll: 0.0
        },
        duration: 1.5 // Flight duration in seconds
      });
    },
    updateMarkers(projects) {
      if (!this.viewer) return;

      // Clear existing entities
      this.viewer.entities.removeAll();
      this.entities = [];
      this.selectedProject = null;

      projects.forEach(project => {
        if (project.centerLng && project.centerLat) {
          const entity = this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(project.centerLng, project.centerLat),
            point: {
              pixelSize: 15,
              color: this.getStatusColor(project.status),
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2
            },
            label: {
              text: project.name,
              font: '14px sans-serif',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -20)
            },
            properties: {
              project: project
            }
          });
          this.entities.push(entity);
          
          // Set selected project for overlay
          if (projects.length === 1) {
            this.selectedProject = project;
          }
        }
      });
    },
    getStatusColor(status) {
      switch (status) {
        case 'inProgress': return Cesium.Color.fromCssColorString('#409eff');
        case 'completed': return Cesium.Color.fromCssColorString('#67c23a');
        case 'delayed': return Cesium.Color.fromCssColorString('#f56c6c');
        default: return Cesium.Color.GRAY;
      }
    },
    getStatusText(status) {
      const map = {
        'planning': '规划中',
        'inProgress': '进行中',
        'completed': '已完成',
        'delayed': '已延期'
      };
      return map[status] || status;
    }
  }
};
</script>

<style scoped>
.project-location-viewer {
  width: 100%;
  height: 100%;
  position: relative;
}

.cesium-container {
  width: 100%;
  height: 100%;
}

.project-info-overlay {
  position: absolute;
  bottom: 20px;
  left: 20px;
  padding: 15px 20px;
  border-radius: 12px;
  min-width: 200px;
  z-index: 100;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-info-overlay h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #2c3e50;
}

.info-row {
  margin: 5px 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  color: #909399;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  color: white;
}

.status-badge.planning { background-color: #909399; }
.status-badge.inProgress { background-color: #409eff; }
.status-badge.completed { background-color: #67c23a; }
.status-badge.delayed { background-color: #f56c6c; }
</style>