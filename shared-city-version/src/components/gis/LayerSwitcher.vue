<template>
  <div class="layer-switcher">
    <h2>图层切换器</h2>
    <ul>
      <li v-for="(layer, index) in layers" :key="index">
        <label>
          <input type="checkbox" v-model="layer.visible" @change="toggleLayerVisibility(layer)" />
          {{ layer.name }}
        </label>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'LayerSwitcher',
  data() {
    return {
      layers: [
        { name: '基础地图', visible: true },
        { name: '卫星影像', visible: false },
        { name: '交通图层', visible: false }
      ]
    };
  },
  methods: {
    toggleLayerVisibility(layer) {
      // 这里可以添加切换图层可见性的实际逻辑
      console.log(`${layer.name} 图层可见性已切换为 ${layer.visible}`);
    }
  }
};
</script>

<style scoped>
.layer-switcher {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.layer-switcher h2 {
  margin-top: 0;
}
.layer-switcher ul {
  list-style: none;
  padding: 0;
}
.layer-switcher li {
  margin-bottom: 8px;
}
</style>
