<template>
  <div class="project-timeline-container">
    <div class="timeline-header">
      <h2>{{ projectName }}</h2>
      <button 
        class="subscribe-btn" 
        :class="{ 'subscribed': isSubscribed }"
        @click="toggleSubscription"
      >
        {{ isSubscribed ? '取消订阅' : '订阅更新' }}
      </button>
    </div>

    <!-- 甘特图容器 -->
    <div ref="ganttContainer" class="gantt-container"></div>

    <!-- 项目阶段详情 -->
    <div class="phase-details" v-if="selectedPhase">
      <h3>{{ selectedPhase.name }}</h3>
      <p>{{ selectedPhase.description }}</p>
      <div class="phase-dates">
        <span>开始: {{ formatDate(selectedPhase.startDate) }}</span>
        <span>结束: {{ formatDate(selectedPhase.endDate) }}</span>
        <span :class="{ 'delayed': isPhaseDelayed(selectedPhase) }">{{ isPhaseDelayed(selectedPhase) ? '延期' : '正常' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useProjectService } from '@/services/project.service'

// 项目ID，从路由参数获取
const route = useRoute()
const projectId = ref(route.params.id || '')

// 引用
const ganttContainer = ref(null)
let chartInstance = null

// 状态
const projectPhases = ref([])
const selectedPhase = ref(null)
const loading = ref(true)
const projectName = ref('项目时间线')

// Vuex store 和服务
const store = useStore()
const projectService = useProjectService()

// 计算属性 - 检查是否订阅
const isSubscribed = computed(() => {
  return store.getters.isProjectSubscribed(projectId.value)
})

// 初始化图表
onMounted(async () => {
  // 加载项目数据
  await loadProjectData()
  // 创建甘特图
  initGanttChart()
  loading.value = false
})

// 卸载组件
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

// 监听项目阶段变化，更新图表
watch(projectPhases, () => {
  if (chartInstance) {
    updateGanttChart()
  }
})

// 加载项目数据
const loadProjectData = async () => {
  try {
    // 获取项目详情
    const project = await projectService.getProjectById(projectId.value)
    projectName.value = project.name

    // 获取项目阶段
    const phases = await projectService.getProjectPhases(projectId.value)
    projectPhases.value = phases

    // 更新Vuex store
    store.dispatch('setProjects', [project])
    store.dispatch('setSelectedProject', project)
  } catch (error) {
    console.error('加载项目数据失败:', error)
    // 显示错误提示
    alert('加载项目数据失败，请重试')
  }
}

// 切换订阅状态
const toggleSubscription = async () => {
  try {
    if (isSubscribed.value) {
      await projectService.unsubscribeProject(projectId.value)
      store.dispatch('unsubscribeProject', projectId.value)
    } else {
      await projectService.subscribeProject(projectId.value)
      store.dispatch('subscribeProject', projectId.value)
    }
  } catch (error) {
    console.error('切换订阅状态失败:', error)
    alert('操作失败，请重试')
  }
}

// 初始化甘特图
const initGanttChart = () => {
  if (!ganttContainer.value) return

  chartInstance = echarts.init(ganttContainer.value)
  updateGanttChart()

  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    chartInstance.resize()
  })
}

// 更新甘特图
const updateGanttChart = () => {
  if (!chartInstance || projectPhases.value.length === 0) return

  // 准备图表数据
  const chartData = projectPhases.value.map(phase => ({
    name: phase.name,
    value: [
      phase.startDate,
      phase.endDate,
      phase.progress || 0
    ],
    itemStyle: {
      color: getPhaseColor(phase)
    }
  }))

  // 计算时间范围
  const allDates = projectPhases.value.flatMap(phase => [new Date(phase.startDate), new Date(phase.endDate)])
  const minDate = new Date(Math.min(...allDates))
  const maxDate = new Date(Math.max(...allDates))
  // 扩展时间范围，增加一些边距
  minDate.setMonth(minDate.getMonth() - 1)
  maxDate.setMonth(maxDate.getMonth() + 1)

  // 图表配置
  const option = {
    tooltip: {
      formatter: function(params) {
        const phase = projectPhases.value.find(p => p.name === params.name)
        if (!phase) return ''

        return `
          <div class="tooltip-title">${phase.name}</div>
          <div>开始: ${formatDate(phase.startDate)}</div>
          <div>结束: ${formatDate(phase.endDate)}</div>
          <div>进度: ${phase.progress || 0}%</div>
          <div>${isPhaseDelayed(phase) ? '<span style="color:red">延期</span>' : '正常'}</div>
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      min: minDate,
      max: maxDate,
      axisLabel: {
        formatter: '{MM}/{dd}/{yyyy}'
      }
    },
    yAxis: {
      type: 'category',
      data: projectPhases.value.map(phase => phase.name),
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        name: '项目阶段',
        type: 'custom',
        renderItem: renderItem,
        itemStyle: {},
        encode: {
          x: [0, 1],
          y: 0
        },
        data: chartData
      }
    ]
  }

  chartInstance.setOption(option)

  // 绑定点击事件
  chartInstance.on('click', (params) => {
    const phase = projectPhases.value.find(p => p.name === params.name)
    if (phase) {
      selectedPhase.value = phase
    }
  })
}

// 自定义甘特图项渲染
const renderItem = (params, api) => {
  const categoryIndex = api.value(0)
  const start = api.coord([api.value(1), categoryIndex])
  const end = api.coord([api.value(2), categoryIndex])
  const height = api.size([0, 1])[1] * 0.6

  // 计算进度条宽度
  const progress = api.value(3) || 0
  const progressWidth = (end[0] - start[0]) * (progress / 100)

  // 背景条
  const rectShape = echarts.graphic.clipRectByRect({
    x: start[0],
    y: start[1] - height / 2,
    width: end[0] - start[0],
    height: height
  }, {
    x: params.coordSys.x,
    y: params.coordSys.y,
    width: params.coordSys.width,
    height: params.coordSys.height
  })

  // 进度条
  const progressShape = echarts.graphic.clipRectByRect({
    x: start[0],
    y: start[1] - height / 2,
    width: progressWidth,
    height: height
  }, {
    x: params.coordSys.x,
    y: params.coordSys.y,
    width: params.coordSys.width,
    height: params.coordSys.height
  })

  // 阶段名称
  const textStyle = {
    text: api.value(0),
    fill: '#000',
    fontSize: 12,
    x: start[0] + 5,
    y: start[1] + height / 2,
    verticalAlign: 'middle'
  }

  if (rectShape && progressShape) {
    return [
      {
        type: 'rect',
        transition: ['shape'],
        shape: rectShape,
        style: {
          fill: '#e6e6e6',
          stroke: '#999',
          lineWidth: 1
        }
      },
      {
        type: 'rect',
        transition: ['shape'],
        shape: progressShape,
        style: {
          fill: api.style('color') || '#1890ff',
          stroke: '#0066cc',
          lineWidth: 1
        }
      },
      {
        type: 'text',
        style: textStyle
      }
    ]
  }
}

// 根据阶段状态获取颜色
const getPhaseColor = (phase) => {
  if (isPhaseDelayed(phase)) {
    return '#ff4d4f' // 红色表示延期
  }

  const progress = phase.progress || 0
  if (progress === 100) {
    return '#52c41a' // 绿色表示完成
  } else if (progress > 0) {
    return '#1890ff' // 蓝色表示进行中
  } else {
    return '#faad14' // 黄色表示未开始
  }
}

// 检查阶段是否延期
const isPhaseDelayed = (phase) => {
  const today = new Date()
  const endDate = new Date(phase.endDate)
  const progress = phase.progress || 0

  return today > endDate && progress < 100
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}
</script>

<style scoped>
.project-timeline-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.subscribe-btn {
  padding: 6px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.subscribe-btn.subscribed {
  background-color: #f5f5f5;
  color: #333;
}

.gantt-container {
  flex: 1;
  min-height: 300px;
}

.phase-details {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border-left: 4px solid #1890ff;
}

.phase-dates {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  color: #666;
}

.delayed {
  color: #ff4d4f;
  font-weight: bold;
}
</style>