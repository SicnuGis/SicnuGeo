<template>
  <div id="cesium-viewer" class="cesium-viewer"></div>
</template>

<script>
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

export default {
  name: 'CesiumViewer',
  mounted() {
    // 初始化 Cesium Viewer
    this.viewer = new Cesium.Viewer('cesium-viewer', {
      animation: false,
      timeline: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      navigationHelpButton: false,
    });
  },
  beforeUnmount() {
    // 销毁 Cesium Viewer 以释放资源
    if (this.viewer) {
      this.viewer.destroy();
    }
  },
};
</script>

<style scoped>
.cesium-viewer {
  width: 100%;
  height: 100%;
}
</style>
