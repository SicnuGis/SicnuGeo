<template>
  <div class="category-filter">
    <div class="filter-header">
      <h3>项目分类筛选</h3>
      <button class="btn-clear" @click="clearFilters" v-if="hasActiveFilters">
        清除筛选
      </button>
    </div>
    
    <!-- 搜索框 -->
    <div class="search-section">
      <div class="search-box">
        <input 
          v-model="searchKeyword" 
          type="text" 
          placeholder="搜索项目名称或描述..."
          class="search-input"
          @input="onSearch"
        />
        <i class="search-icon">🔍</i>
      </div>
    </div>

    <!-- 分类选择 -->
    <div class="category-section">
      <h4>按分类筛选</h4>
      <div class="category-grid">
        <div 
          v-for="category in categories" 
          :key="category.value"
          :class="['category-item', { active: selectedCategories.includes(category.value) }]"
          @click="toggleCategory(category.value)"
          :style="{ '--category-color': category.color }"
        >
          <span class="category-icon">{{ category.icon }}</span>
          <span class="category-label">{{ category.label }}</span>
          <span class="category-count">({{ getCategoryCount(category.value) }})</span>
        </div>
      </div>
    </div>

    <!-- 状态筛选 -->
    <div class="status-section">
      <h4>按状态筛选</h4>
      <div class="status-buttons">
        <button 
          v-for="status in statusOptions" 
          :key="status.value"
          :class="['status-btn', { active: selectedStatus === status.value }]"
          @click="selectStatus(status.value)"
        >
          <span class="status-icon" :style="{ color: status.color }">{{ status.icon }}</span>
          {{ status.label }}
        </button>
      </div>
    </div>

    <!-- 筛选结果统计 -->
    <div class="filter-stats">
      <div class="stats-item">
        <span class="stats-number">{{ filteredCount }}</span>
        <span class="stats-label">个项目</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllCategoryOptions } from '@/services/category.service'

export default {
  name: 'CategoryFilter',
  props: {
    projects: {
      type: Array,
      default: () => []
    },
    filteredCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      searchKeyword: '',
      selectedCategories: [],
      selectedStatus: 'all',
      categories: getAllCategoryOptions(),
      statusOptions: [
        { value: 'all', label: '全部状态', icon: '📋', color: '#666666' },
        { value: 'notStarted', label: '未开始', icon: '⏳', color: '#f59e0b' },
        { value: 'inProgress', label: '进行中', icon: '🔄', color: '#3b82f6' },
        { value: 'completed', label: '已完成', icon: '✅', color: '#10b981' },
        { value: 'delayed', label: '延期', icon: '⚠️', color: '#ef4444' }
      ]
    }
  },
  computed: {
    hasActiveFilters() {
      return this.searchKeyword.trim() !== '' || 
             this.selectedCategories.length > 0 || 
             this.selectedStatus !== 'all'
    }
  },
  methods: {
    toggleCategory(categoryValue) {
      const index = this.selectedCategories.indexOf(categoryValue)
      if (index > -1) {
        this.selectedCategories.splice(index, 1)
      } else {
        this.selectedCategories.push(categoryValue)
      }
      this.emitFilterChange()
    },
    
    selectStatus(statusValue) {
      this.selectedStatus = statusValue
      this.emitFilterChange()
    },
    
    onSearch() {
      // 防抖处理
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.emitFilterChange()
      }, 300)
    },
    
    clearFilters() {
      this.searchKeyword = ''
      this.selectedCategories = []
      this.selectedStatus = 'all'
      this.emitFilterChange()
    },
    
    emitFilterChange() {
      const filters = {
        keyword: this.searchKeyword.trim(),
        categories: [...this.selectedCategories],
        status: this.selectedStatus === 'all' ? null : this.selectedStatus
      }
      this.$emit('filter-change', filters)
    },
    
    getCategoryCount(categoryValue) {
      return this.projects.filter(project => 
        project.category === categoryValue
      ).length
    }
  },
  
  beforeDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  }
}
</script>

<style scoped>
.category-filter {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 80vh;
  overflow-y: auto;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.filter-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.btn-clear {
  padding: 6px 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-clear:hover {
  background: #e5e7eb;
  color: #374151;
}

.search-section {
  margin-bottom: 24px;
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 16px;
}

.category-section,
.status-section {
  margin-bottom: 24px;
}

.category-section h4,
.status-section h4 {
  margin: 0 0 12px;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.category-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.category-item:hover {
  border-color: var(--category-color);
  background: rgba(var(--category-color-rgb, 59, 130, 246), 0.05);
}

.category-item.active {
  border-color: var(--category-color);
  background: var(--category-color);
  color: white;
}

.category-icon {
  font-size: 18px;
  margin-right: 8px;
}

.category-label {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
}

.category-count {
  font-size: 12px;
  opacity: 0.7;
}

.status-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-btn {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.status-btn:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.status-btn.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

.status-icon {
  margin-right: 8px;
  font-size: 14px;
}

.filter-stats {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-number {
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
  line-height: 1;
}

.stats-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .category-filter {
    padding: 16px;
  }
  
  .filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .category-grid {
    grid-template-columns: 1fr;
  }
}
</style>