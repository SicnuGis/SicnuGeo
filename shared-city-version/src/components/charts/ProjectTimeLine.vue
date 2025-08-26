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

    <!-- 评论区 -->
    <div class="comments">
      <h3>项目评论</h3>
      <div v-if="comments.length === 0" class="empty">暂无评论</div>
      <div v-for="c in comments" :key="c.id" class="comment-item">
        <div class="meta">
          <strong>{{ c.authorName || '匿名' }}</strong>
          <span>{{ formatDate(c.createdAt) }}</span>
        </div>
        <div class="content">{{ c.content }}</div>
      </div>
      <div class="comment-form">
        <textarea v-model="newComment" placeholder="发表你的看法..." />
        <button @click="submitComment">发表评论</button>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { useProjectService } from '@/services/project.service'

export default {
  props: {
    // 优先使用父组件传入的项目ID；未传入时回退到路由参数
    projectId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      // 路由参数中的项目ID（作为回退）
      routeProjectId: this.$route?.params?.id || '',
      
      // 状态
      projectPhases: [],
      selectedPhase: null,
      loading: true,
      projectName: '项目时间线',
      // 新增评论状态
      comments: [],
      newComment: '' ,
      // 图表实例
      chartInstance: null,
      projectService: null
    }
  },
  
  computed: {
    // 实际使用的项目ID：优先 props，其次路由参数
    effectiveProjectId() {
      return this.projectId || this.routeProjectId || ''
    },
    // 计算属性 - 检查是否订阅
    isSubscribed() {
      if (!this.$store || !this.$store.getters) return false
      return this.$store.getters.isProjectSubscribed(this.effectiveProjectId)
    }
  },
  
  // 生命周期钩子
  mounted() {
    // 初始化服务
    this.projectService = useProjectService()
    
    // 加载项目数据
    this.loadProjectData()
      .then(() => {
        // 创建甘特图
        this.initGanttChart()
        this.loading = false
      })
      .catch(error => {
        console.error('初始化失败:', error)
        this.loading = false
      })
  },
  
  // 组件销毁前
  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose()
      this.chartInstance = null
    }
    
    // 移除事件监听器
    if (this.resizeChart) {
      window.removeEventListener('resize', this.resizeChart)
    }
  },
  
  // 监听属性变化
  watch: {
    projectPhases: {
      handler() {
        if (this.chartInstance) {
          this.updateGanttChart()
        }
      },
      deep: true
    },
    // 当外部传入的 projectId 变化时，重新加载数据
    projectId() {
      this.loadProjectData()
    }
  },
  
  methods: {
    // 加载项目数据（分步容错：项目详情失败才提示，阶段/评论失败不阻塞）
    async loadProjectData() {
      const id = this.effectiveProjectId
      if (!id) {
        console.warn('未提供项目ID，无法加载时间线数据')
        return
      }
      try {
        // 获取项目详情
        const project = await this.projectService.getProjectById(id)
        this.projectName = project.name

        // 并行获取阶段与评论，任何一个失败都不阻塞另一个
        const [phasesRes, commentsRes] = await Promise.allSettled([
          this.projectService.getProjectPhases(id),
          this.projectService.getProjectComments(id)
        ])

        if (phasesRes.status === 'fulfilled') {
          this.projectPhases = phasesRes.value || []
        } else {
          console.warn('项目阶段接口不可用或返回错误，使用空阶段渲染', phasesRes.reason)
          this.projectPhases = []
        }

        if (commentsRes.status === 'fulfilled') {
          this.comments = commentsRes.value || []
        } else {
          console.warn('项目评论接口不可用或返回错误，使用空评论', commentsRes.reason)
          this.comments = []
        }

        // 更新Vuex store
        this.$store && this.$store.dispatch && this.$store.dispatch('setProjects', [project])
        this.$store && this.$store.dispatch && this.$store.dispatch('setSelectedProject', project)
      } catch (error) {
        console.error('加载项目数据失败:', error)
        // 显示错误提示（仅在项目详情失败时触发）
        alert('加载项目数据失败，请重试')
      }
    },

    // 切换订阅状态
    async toggleSubscription() {
      const id = this.effectiveProjectId
      if (!id) return
      try {
        if (this.isSubscribed) {
          await this.projectService.unsubscribeProject(id)
          this.$store && this.$store.dispatch && this.$store.dispatch('unsubscribeProject', id)
        } else {
          await this.projectService.subscribeProject(id)
          this.$store && this.$store.dispatch && this.$store.dispatch('subscribeProject', id)
        }
      } catch (error) {
        console.error('切换订阅状态失败:', error)
        alert('操作失败，请重试')
      }
    },

    // 初始化甘特图
    initGanttChart() {
      if (!this.$refs.ganttContainer) return

      this.chartInstance = echarts.init(this.$refs.ganttContainer)
      this.updateGanttChart()

      // 监听窗口大小变化，调整图表大小
      this.resizeChart = () => this.chartInstance.resize()
      window.addEventListener('resize', this.resizeChart)
    },

    // 更新甘特图
    updateGanttChart() {
      if (!this.chartInstance || this.projectPhases.length === 0) return

      // 准备图表数据
      const chartData = this.projectPhases.map(phase => ({
        name: phase.name,
        value: [
          phase.startDate,
          phase.endDate,
          phase.progress || 0
        ],
        itemStyle: {
          color: this.getPhaseColor(phase)
        }
      }))

      // 计算时间范围
      const allDates = this.projectPhases.flatMap(phase => [new Date(phase.startDate), new Date(phase.endDate)])
      const minDate = new Date(Math.min(...allDates))
      const maxDate = new Date(Math.max(...allDates))
      // 扩展时间范围，增加一些边距
      minDate.setMonth(minDate.getMonth() - 1)
      maxDate.setMonth(maxDate.getMonth() + 1)

      // 图表配置
      const option = {
        tooltip: {
          formatter: (params) => {
            const phase = this.projectPhases.find(p => p.name === params.name)
            if (!phase) return ''

            return `
              <div class="tooltip-title">${phase.name}</div>
              <div>开始: ${this.formatDate(phase.startDate)}</div>
              <div>结束: ${this.formatDate(phase.endDate)}</div>
              <div>进度: ${phase.progress || 0}%</div>
              <div>${this.isPhaseDelayed(phase) ? '<span style="color:red">延期</span>' : '正常'}</div>
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
          data: this.projectPhases.map(phase => phase.name),
          axisLine: { show: false },
          axisTick: { show: false }
        },
        series: [
          {
            name: '项目阶段',
            type: 'custom',
            renderItem: this.renderItem,
            itemStyle: {},
            encode: {
              x: [0, 1],
              y: 0
            },
            data: chartData
          }
        ]
      }

      this.chartInstance.setOption(option)

      // 绑定点击事件
      this.chartInstance.on('click', (params) => {
        const phase = this.projectPhases.find(p => p.name === params.name)
        if (phase) {
          this.selectedPhase = phase
        }
      })
    },

    // 自定义甘特图项渲染
    renderItem(params, api) {
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
      return null
    },

    // 根据阶段状态获取颜色
    getPhaseColor(phase) {
      if (this.isPhaseDelayed(phase)) {
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
    },

    // 检查阶段是否延期
    isPhaseDelayed(phase) {
      const today = new Date()
      const endDate = new Date(phase.endDate)
      const progress = phase.progress || 0

      return today > endDate && progress < 100
    },

    // 格式化日期
    formatDate(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    },
    async submitComment() {
      const id = this.effectiveProjectId
      if (!this.newComment || !id) return
      try {
        await this.projectService.addProjectComment(id, { content: this.newComment })
        this.newComment = ''
        this.comments = await this.projectService.getProjectComments(id)
      } catch (e) {
        alert('发表评论失败，请重试')
      }
    },
  }
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
  margin-bottom: 20px;
}

.gantt-container {
  flex: 1;
  min-height: 300px;
}

.phase-details {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.phase-dates {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.delayed {
  color: #ff4d4f;
  font-weight: bold;
}

.subscribe-btn {
  padding: 8px 16px;
  border: 1px solid #1890ff;
  background-color: white;
  color: #1890ff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.subscribe-btn:hover {
  background-color: #e6f7ff;
}

.subscribe-btn.subscribed {
  background-color: #1890ff;
  color: white;
}
.comments { margin-top: 24px; background:#fff; border-radius:8px; padding:12px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.comment-item { border-bottom:1px solid #eee; padding:8px 0; }
.comment-item:last-child { border-bottom:none; }
.comment-item .meta { color:#666; font-size:12px; display:flex; justify-content:space-between; }
.comment-form { margin-top: 10px; display:flex; gap:8px; }
.comment-form textarea { flex:1; min-height: 60px; padding:8px; }
.comment-form button { padding:8px 12px; }
</style>