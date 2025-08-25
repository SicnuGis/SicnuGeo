<template>
  <div class="map-explorer">
    <h1>地图浏览器</h1>
    <div id="map-container"></div>
  </div>
</template>

<script>
export default {
  name: 'MapExplorer',
  mounted() {
    // 模拟初始化地图
    console.log('地图初始化完成');
  }
}
</script>

<style scoped>
.map-explorer {
  width: 100%;
  height: 100vh;
}

#map-container {
  width: 100%;
  height: calc(100% - 40px);
}
</style>
