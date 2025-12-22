<template>
  <div class="time-slider">
    <el-slider
      v-model="currentTimeIndex"
      :min="0"
      :max="timeSteps.length - 1"
      :step="1"
      @change="handleTimeChange"
      show-input
      show-input-controls
      range
      :input-size="'small'"
    >
      <template #tooltip="{ value }">
        {{ timeSteps[value] }}
      </template>
    </el-slider>
  </div>
</template>

<script>
export default {
  name: 'TimeSlider',
  props: {
    timeSteps: {
      type: Array,
      default: () => [],
      validator: (value) => {
        return value.every(item => typeof item === 'string');
      }
    }
  },
  data() {
    return {
      currentTimeIndex: 0
    };
  },
  methods: {
    handleTimeChange(newValue) {
      this.$emit('time-change', {
        startIndex: Array.isArray(newValue) ? newValue[0] : newValue,
        endIndex: Array.isArray(newValue) ? newValue[1] : newValue,
        start: this.timeSteps[Array.isArray(newValue) ? newValue[0] : newValue],
        end: this.timeSteps[Array.isArray(newValue) ? newValue[1] : newValue]
      });
    }
  }
};
</script>

<style scoped>
.time-slider {
  padding: 20px;
}
</style>
