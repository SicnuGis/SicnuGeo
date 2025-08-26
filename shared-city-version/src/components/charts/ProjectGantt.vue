<template>
  <div class="project-gantt">
    <div class="gantt-header">
      <h4>项目甘特图</h4>
      <div class="gantt-controls">
        <div class="view-mode-controls">
          <button 
            @click="setViewMode('overview')" 
            :class="['btn-view', { active: viewMode === 'overview' }]"
          >
            概览
          </button>
          <button 
            @click="setViewMode('detailed')" 
            :class="['btn-view', { active: viewMode === 'detailed' }]"
          >
            详细
          </button>
        </div>
        <div class="zoom-controls">
          <button @click="zoomIn" class="btn-zoom">放大</button>
          <button @click="zoomOut" class="btn-zoom">缩小</button>
          <button @click="resetView" class="btn-zoom">重置</button>
        </div>
        <div class="navigation-controls" v-if="viewMode === 'detailed'">
          <button @click="navigatePrevious" class="btn-nav">‹ 上月</button>
          <button @click="navigateToday" class="btn-nav">今天</button>
          <button @click="navigateNext" class="btn-nav">下月 ›</button>
        </div>
      </div>
    </div>
    <div class="gantt-container">
      <g-gantt-chart
        :chart-start="chartStart"
        :chart-end="chartEnd"
        :precision="precision"
        :bar-start="barStart"
        :bar-end="barEnd"
        :date-format="dateFormat"
        :width="chartWidth"
        :hide-timeaxis="false"
        :colorScheme="colorScheme"
        :grid="true"
        :push-on-overlap="true"
        :no-overlap="false"
        :row-height="40"
        :label-column-title="'任务名称'"
        :label-column-width="200"
      >
        <g-gantt-row
          v-for="(task, index) in ganttTasks"
          :key="task.id"
          :label="task.label"
          :bars="task.bars"
          :highlight-on-hover="true"
        />
      </g-gantt-chart>
    </div>
    <div class="gantt-legend">
      <div class="legend-item">
        <span class="legend-color planning"></span>
        <span>规划阶段</span>
      </div>
      <div class="legend-item">
        <span class="legend-color development"></span>
        <span>开发阶段</span>
      </div>
      <div class="legend-item">
        <span class="legend-color testing"></span>
        <span>测试阶段</span>
      </div>
      <div class="legend-item">
        <span class="legend-color deployment"></span>
        <span>部署阶段</span>
      </div>
    </div>
  </div>
</template>

<script>
import { GGanttChart, GGanttRow } from 'vue-ganttastic'

export default {
  name: 'ProjectGantt',
  components: {
    GGanttChart,
    GGanttRow
  },
  props: {
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      chartWidth: '100%',
      precision: 'week',
      dateFormat: 'YYYY-MM-DD',
      viewMode: 'overview', // overview, detailed
      colorScheme: {
        primary: '#3498db',
        secondary: '#2ecc71',
        ternary: '#e74c3c',
        quartenary: '#f39c12',
        hoverHighlight: '#ecf0f1',
        markerCurrentTime: '#e74c3c',
        text: '#2c3e50',
        background: '#ffffff'
      },
      ganttTasks: [],
      currentViewStart: null,
      currentViewEnd: null
    }
  },
  computed: {
    chartStart() {
      if (this.currentViewStart) return this.currentViewStart
      
      if (this.ganttTasks.length === 0) return new Date()
      const dates = this.ganttTasks.flatMap(task => 
        task.bars.map(bar => new Date(bar.start))
      )
      const minDate = new Date(Math.min(...dates))
      
      if (this.viewMode === 'overview') {
        // 概览模式：显示整个项目时间范围，但限制在3个月内
        const today = new Date()
        const threeMonthsAgo = new Date(today)
        threeMonthsAgo.setMonth(today.getMonth() - 1)
        return minDate > threeMonthsAgo ? minDate : threeMonthsAgo
      } else {
        // 详细模式：显示当前时间前后各1个月
        const today = new Date()
        const oneMonthAgo = new Date(today)
        oneMonthAgo.setMonth(today.getMonth() - 1)
        return oneMonthAgo
      }
    },
    chartEnd() {
      if (this.currentViewEnd) return this.currentViewEnd
      
      if (this.ganttTasks.length === 0) return new Date()
      const dates = this.ganttTasks.flatMap(task => 
        task.bars.map(bar => new Date(bar.end))
      )
      const maxDate = new Date(Math.max(...dates))
      
      if (this.viewMode === 'overview') {
        // 概览模式：限制在当前时间后3个月
        const today = new Date()
        const threeMonthsLater = new Date(today)
        threeMonthsLater.setMonth(today.getMonth() + 3)
        return maxDate < threeMonthsLater ? maxDate : threeMonthsLater
      } else {
        // 详细模式：显示当前时间后1个月
        const today = new Date()
        const oneMonthLater = new Date(today)
        oneMonthLater.setMonth(today.getMonth() + 1)
        return oneMonthLater
      }
    },
    barStart() {
      return 'start'
    },
    barEnd() {
      return 'end'
    }
  },
  mounted() {
    this.loadGanttData()
  },
  methods: {
    loadGanttData() {
      // 模拟甘特图数据，实际应该从API获取
      const projectStartDate = new Date('2024-01-01')
      const projectEndDate = new Date('2024-06-30')
      
      this.ganttTasks = [
        {
          id: 1,
          label: '需求分析',
          bars: [{
            id: 'req-analysis',
            start: '2024-01-01',
            end: '2024-01-15',
            ganttBarConfig: {
              style: {
                background: '#3498db',
                borderRadius: '4px',
                color: '#ffffff'
              },
              label: '需求分析 (100%)'
            }
          }]
        },
        {
          id: 2,
          label: '系统设计',
          bars: [{
            id: 'system-design',
            start: '2024-01-10',
            end: '2024-02-05',
            ganttBarConfig: {
              style: {
                background: '#2ecc71',
                borderRadius: '4px',
                color: '#ffffff'
              },
              label: '系统设计 (90%)'
            }
          }]
        },
        {
          id: 3,
          label: '前端开发',
          bars: [{
            id: 'frontend-dev',
            start: '2024-02-01',
            end: '2024-04-15',
            ganttBarConfig: {
              style: {
                background: '#f39c12',
                borderRadius: '4px',
                color: '#ffffff'
              },
              label: '前端开发 (75%)'
            }
          }]
        },
        {
          id: 4,
          label: '后端开发',
          bars: [{
            id: 'backend-dev',
            start: '2024-02-15',
            end: '2024-05-01',
            ganttBarConfig: {
              style: {
                background: '#9b59b6',
                borderRadius: '4px',
                color: '#ffffff'
              },
              label: '后端开发 (60%)'
            }
          }]
        },
        {
          id: 5,
          label: '系统测试',
          bars: [{
            id: 'testing',
            start: '2024-04-20',
            end: '2024-05-30',
            ganttBarConfig: {
              style: {
                background: '#e74c3c',
                borderRadius: '4px',
                color: '#ffffff'
              },
              label: '系统测试 (30%)'
            }
          }]
        },
        {
          id: 6,
          label: '部署上线',
          bars: [{
            id: 'deployment',
            start: '2024-05-25',
            end: '2024-06-30',
            ganttBarConfig: {
              style: {
                background: '#34495e',
                borderRadius: '4px',
                color: '#ffffff'
              },
              label: '部署上线 (0%)'
            }
          }]
        }
      ]
    },
    setViewMode(mode) {
      this.viewMode = mode
      this.currentViewStart = null
      this.currentViewEnd = null
      if (mode === 'overview') {
        this.precision = 'week'
      } else {
        this.precision = 'day'
      }
    },
    zoomIn() {
      if (this.precision === 'week') {
        this.precision = 'day'
      } else if (this.precision === 'day') {
        this.precision = 'hour'
      }
    },
    zoomOut() {
      if (this.precision === 'hour') {
        this.precision = 'day'
      } else if (this.precision === 'day') {
        this.precision = 'week'
      } else if (this.precision === 'week') {
        this.precision = 'month'
      }
    },
    resetView() {
      this.viewMode = 'overview'
      this.precision = 'week'
      this.currentViewStart = null
      this.currentViewEnd = null
    },
    navigatePrevious() {
      if (this.viewMode === 'detailed') {
        const currentStart = this.currentViewStart || new Date()
        const newStart = new Date(currentStart)
        newStart.setMonth(newStart.getMonth() - 1)
        const newEnd = new Date(newStart)
        newEnd.setMonth(newEnd.getMonth() + 2)
        
        this.currentViewStart = newStart
        this.currentViewEnd = newEnd
      }
    },
    navigateNext() {
      if (this.viewMode === 'detailed') {
        const currentStart = this.currentViewStart || new Date()
        const newStart = new Date(currentStart)
        newStart.setMonth(newStart.getMonth() + 1)
        const newEnd = new Date(newStart)
        newEnd.setMonth(newEnd.getMonth() + 2)
        
        this.currentViewStart = newStart
        this.currentViewEnd = newEnd
      }
    },
    navigateToday() {
      if (this.viewMode === 'detailed') {
        const today = new Date()
        const start = new Date(today)
        start.setMonth(start.getMonth() - 1)
        const end = new Date(today)
        end.setMonth(end.getMonth() + 1)
        
        this.currentViewStart = start
        this.currentViewEnd = end
      }
    }
  }
}
</script>

<style scoped>
.project-gantt {
  width: 100%;
  max-width: 100%;
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  overflow: hidden;
}

.gantt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e6ed;
}

.gantt-header h4 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.gantt-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.view-mode-controls,
.zoom-controls,
.navigation-controls {
  display: flex;
  gap: 4px;
}

.btn-view,
.btn-zoom,
.btn-nav {
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #475569;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-view:hover,
.btn-zoom:hover,
.btn-nav:hover {
  background: #e2e8f0;
  color: #334155;
}

.btn-view.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-nav {
  font-size: 11px;
  padding: 4px 8px;
}

.navigation-controls {
  border-left: 1px solid #e2e8f0;
  padding-left: 12px;
}

.gantt-container {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-sizing: border-box;
}

.gantt-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding-top: 15px;
  border-top: 1px solid #e0e6ed;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-color.planning {
  background: #3498db;
}

.legend-color.development {
  background: #f39c12;
}

.legend-color.testing {
  background: #e74c3c;
}

.legend-color.deployment {
  background: #34495e;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .gantt-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .gantt-controls {
    width: 100%;
    justify-content: flex-start;
    gap: 8px;
  }
  
  .view-mode-controls,
  .zoom-controls,
  .navigation-controls {
    gap: 2px;
  }
  
  .btn-view,
  .btn-zoom,
  .btn-nav {
    padding: 4px 8px;
    font-size: 11px;
  }
  
  .navigation-controls {
    border-left: none;
    padding-left: 0;
    border-top: 1px solid #e2e8f0;
    padding-top: 8px;
    width: 100%;
    justify-content: center;
  }
  
  .gantt-legend {
    justify-content: center;
  }
}
</style>