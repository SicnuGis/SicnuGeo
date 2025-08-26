<template>
  <div class="project-admin">
    <div class="admin-header">
      <h1>项目管理</h1>
      <div class="search-section">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索项目名称或分类..." 
          class="search-input"
          @input="handleSearch"
        />
        <select v-model="selectedCategory" @change="handleSearch" class="category-select">
          <option value="">全部分类</option>
          <option value="smart_city">智慧城市</option>
          <option value="transportation">交通运输</option>
          <option value="environment">环境保护</option>
          <option value="energy">能源电力</option>
          <option value="water_conservancy">水利工程</option>
          <option value="construction">建筑工程</option>
          <option value="municipal">市政工程</option>
        </select>
      </div>
      <button class="btn-add-project" @click="showAddProjectForm">添加新项目</button>
    </div>

    <!-- 项目列表 -->
    <div class="project-list">
      <div class="project-list-header">
        <div class="header-item">项目名称</div>
        <div class="header-item">负责人</div>
        <div class="header-item">状态</div>
        <div class="header-item">开始日期</div>
        <div class="header-item">结束日期</div>
        <div class="header-item">操作</div>
      </div>
      <div v-for="project in filteredProjects" :key="project.id" class="project-item">
        <div class="item-content">{{ project.name }}</div>
        <div class="item-content">{{ project.manager }}</div>
        <div class="item-content">
          <span :class="['status-badge', 'status-' + project.status]">{{ project.status }}</span>
        </div>
        <div class="item-content">{{ project.startDate }}</div>
        <div class="item-content">{{ project.endDate }}</div>
        <div class="item-actions">
          <button @click="viewProjectDetail(project.id)">查看</button>
          <button @click="editProject(project.id)">编辑</button>
          <button @click="deleteProject(project.id)">删除</button>
        </div>
      </div>
    </div>

    <!-- 项目详情弹窗 -->
    <div v-if="showDetail" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>项目详情 - {{ selectedProject?.name }}</h2>
          <button class="btn-close" @click="showDetail = false">关闭</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedProject" class="project-detail">
            <div class="detail-section">
              <h3>基本信息</h3>
              <p><strong>项目名称:</strong> {{ selectedProject.name }}</p>
              <p><strong>负责人:</strong> {{ selectedProject.manager }}</p>
              <p><strong>状态:</strong> <span :class="['status-badge', 'status-' + selectedProject.status]">{{ selectedProject.status }}</span></p>
              <p><strong>开始日期:</strong> {{ selectedProject.startDate }}</p>
              <p><strong>结束日期:</strong> {{ selectedProject.endDate }}</p>
            </div>
            <div class="detail-section">
              <h3>项目描述</h3>
              <div class="rich-text" v-text="selectedProject.description"></div>
            </div>
            <div class="detail-section">
              <h3>空间分析</h3>
              <ArcgisAnalysisPanel :project-id="selectedProject.id" :center="normalizeCenter(selectedProject)" :zoom="12" />
            </div>
            <div class="detail-section">
              <h3>项目进度</h3>
              <ProjectGantt :project-id="selectedProject.id" />
            </div>
            <div class="detail-section">
              <h3>项目评论</h3>
              <ProjectComments :project-id="selectedProject.id" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑项目表单（内嵌地图编辑器） -->
    <div v-if="showForm" class="modal-overlay">
      <div class="modal modal-wide">
        <div class="modal-header">
          <h2>{{ isEditing ? '编辑项目' : '添加新项目' }}</h2>
          <button class="btn-close" @click="showForm = false">关闭</button>
        </div>
        <div class="modal-body">
          <ProjectMapEditor
            :embed="true"
            height="560px"
            :mode-prop="isEditing ? 'edit' : 'create'"
            :project-id-prop="selectedProject?.id || null"
            @saved="onEditorSaved"
            @cancel="showForm = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProjectGantt from '@/components/charts/ProjectGantt.vue';
// import CesiumViewer from '@/components/gis/CesiumViewer.vue';
import { projectService } from '@/services/project.service';
import { getCategoryLabel } from '@/services/category.service';
import ArcgisAnalysisPanel from '@/components/ArcgisAnalysisPanel.vue';
import ProjectMapEditor from '@/components/gis/ProjectMapEditor.vue';
import ProjectComments from '@/components/ProjectComments.vue';
import { parseShpFiles, validateShpFiles, getShpStatistics } from '@/services/shp.service';

export default {
  name: 'ProjectAdmin',
  components: {
    ProjectGantt,
    // CesiumViewer,
    ArcgisAnalysisPanel,
    ProjectMapEditor,
    ProjectComments
  },
  data() {
    return {
      projects: [],
      filteredProjects: [],
      searchQuery: '',
      selectedCategory: '',
      showDetail: false,
      showForm: false,
      isEditing: false,
      selectedProject: null,
      formData: {
        name: '',
        manager: '',
        status: 'planning',
        startDate: '',
        endDate: '',
        description: '',
        location: ''
      }
    }
  },
  mounted() {
    this.loadProjects();
  },
  methods: {
    async loadProjects() {
      try {
        const data = await projectService.getAllProjects();
        this.projects = data || [];
        this.filteredProjects = this.projects;
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    },
    handleSearch() {
      let filtered = this.projects;
      
      // 按分类筛选
      if (this.selectedCategory) {
        filtered = filtered.filter(project => project.category === this.selectedCategory);
      }
      
      // 按搜索关键词筛选
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(project => {
          const projectName = project.name?.toLowerCase() || '';
          const categoryLabel = getCategoryLabel(project.category)?.toLowerCase() || '';
          const manager = project.manager?.toLowerCase() || '';
          
          return projectName.includes(query) || 
                 categoryLabel.includes(query) || 
                 manager.includes(query);
        });
      }
      
      this.filteredProjects = filtered;
    },
    async viewProjectDetail(id) {
      try {
        const data = await projectService.getProjectById(id);
        this.selectedProject = data;
        this.showDetail = true;
      } catch (error) {
        console.error('Failed to load project detail:', error);
      }
    },
    showAddProjectForm() {
      this.isEditing = false;
      this.selectedProject = null;
      this.showForm = true;
    },
    async editProject(id) {
      try {
        const data = await projectService.getProjectById(id);
        this.selectedProject = data;
        this.isEditing = true;
        this.showForm = true;
      } catch (error) {
        console.error('Failed to load project for editing:', error);
      }
    },
    async deleteProject(id) {
      if (confirm('确定要删除这个项目吗？')) {
        try {
          await projectService.deleteProject(id);
          await this.loadProjects();
        } catch (error) {
          console.error('Failed to delete project:', error);
        }
      }
    },
    onLocationSelected(location) {
      this.formData.location = location;
    },
    normalizeCenter(p) {
      const lng = Number(p?.centerLng) || 104.0668;
      const lat = Number(p?.centerLat) || 30.5728;
      return [lng, lat];
    },
    async onEditorSaved(payload) {
      // 关闭弹窗并刷新列表
      this.showForm = false;
      await this.loadProjects();
      this.handleSearch(); // 重新应用搜索筛选
      if (payload?.id) {
        // 如果是创建完成，打开详情进行核对
        this.viewProjectDetail(payload.id);
      }
    },

    // 文件上传处理方法
    handleDocumentSuccess(response, file, fileList) {
      console.log('项目书上传成功:', file.name);
      // 这里可以处理上传成功后的逻辑
      // 例如保存文件信息到项目数据中
    },

    handleDocumentRemove(file, fileList) {
      console.log('项目书移除:', file.name);
      // 这里可以处理文件移除后的逻辑
    },

    async handleShpSuccess(response, file, fileList) {
      console.log('SHP文件上传成功:', file.name);
      
      try {
        // 获取所有相关的SHP文件
        const shpFiles = fileList.map(f => f.raw || f).filter(f => f instanceof File);
        
        // 验证SHP文件集
        const validation = validateShpFiles(shpFiles);
        if (!validation.valid) {
          console.warn('SHP文件验证失败:', validation.message);
          return;
        }

        // 解析SHP文件
        const parseResult = await parseShpFiles(shpFiles);
        if (parseResult.success) {
          console.log('SHP文件解析成功:', parseResult.data);
          
          // 获取统计信息
          const stats = getShpStatistics(parseResult.data);
          console.log('SHP文件统计:', stats);
          
          // 这里可以将解析后的GeoJSON数据保存到项目中
          // 或者显示在地图上
          this.handleShpDataParsed(parseResult.data, stats);
        } else {
          console.error('SHP文件解析失败:', parseResult.error);
        }
      } catch (error) {
        console.error('处理SHP文件时出错:', error);
      }
    },

    handleShpRemove(file, fileList) {
      console.log('SHP文件移除:', file.name);
      // 这里可以处理SHP文件移除后的逻辑
    },

    handleShpDataParsed(geoJsonData, statistics) {
      // 处理解析后的SHP数据
      console.log('处理解析后的SHP数据:', {
        features: geoJsonData.features?.length || 0,
        geometryTypes: statistics.geometryTypes,
        bounds: statistics.bounds
      });
      
      // 可以在这里:
      // 1. 将数据保存到项目的地理数据字段中
      // 2. 在地图上显示数据预览
      // 3. 更新项目的地理边界信息
      
      // 示例：更新项目的地理信息
      if (statistics.bounds && this.selectedProject) {
        this.selectedProject.geoData = geoJsonData;
        this.selectedProject.geoBounds = statistics.bounds;
        this.selectedProject.geoStatistics = statistics;
      }
    }
  }
}
</script>

<style scoped>
/* 主容器样式 */
.project-admin {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 120px);
}

/* 头部样式 */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 搜索区域样式 */
.search-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  width: 240px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4096ff;
  box-shadow: 0 0 0 3px rgba(64, 150, 255, 0.1);
}

.category-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-select:focus {
  outline: none;
  border-color: #4096ff;
  box-shadow: 0 0 0 3px rgba(64, 150, 255, 0.1);
}

.admin-header h1 {
  margin: 0;
  color: #1f2937;
  font-size: 24px;
  font-weight: 600;
}

.btn-add-project {
  padding: 10px 20px;
  background: linear-gradient(135deg, #4096ff 0%, #1677ff 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(64, 150, 255, 0.3);
}

.btn-add-project:hover {
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 150, 255, 0.4);
}

/* 项目列表样式 */
.project-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.project-list-header {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 1.2fr 1.2fr 1.5fr;
  gap: 16px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 2px solid #e2e8f0;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.header-item {
  display: flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.project-item {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 1.2fr 1.2fr 1.5fr;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  align-items: center;
}

.project-item:hover {
  background: #f8fafc;
  transform: translateX(2px);
}

.project-item:last-child {
  border-bottom: none;
}

.item-content {
  color: #374151;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

/* 状态徽章样式 */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-planning {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fbbf24;
}

.status-inProgress {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #3b82f6;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.status-delayed {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

/* 操作按钮样式 */
.item-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.item-actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.item-actions button:first-child {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #0ea5e9;
}

.item-actions button:first-child:hover {
  background: #0ea5e9;
  color: white;
}

.item-actions button:nth-child(2) {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #22c55e;
}

.item-actions button:nth-child(2):hover {
  background: #22c55e;
  color: white;
}

.item-actions button:last-child {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

.item-actions button:last-child:hover {
  background: #ef4444;
  color: white;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  width: 900px;
  max-height: 90vh;
  overflow: auto;
  background: white;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal.modal-wide {
  width: 1100px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.modal-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
}

.btn-close {
  padding: 8px 16px;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 24px 32px;
}

/* 项目详情样式 */
.project-detail {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.detail-section {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.detail-section h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.detail-section p {
  margin: 8px 0;
  color: #4b5563;
  line-height: 1.6;
}

.detail-section strong {
  color: #1f2937;
  font-weight: 600;
}

.rich-text {
  white-space: pre-wrap;
  line-height: 1.75;
  word-break: break-word;
  overflow-wrap: anywhere;
  color: #374151;
  font-size: 14px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .project-list-header,
  .project-item {
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.2fr;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .project-admin {
    padding: 16px;
  }
  
  .admin-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .project-list-header,
  .project-item {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .header-item {
    display: none;
  }
  
  .project-item {
    display: block;
    padding: 16px;
  }
  
  .item-content {
    margin-bottom: 8px;
    padding: 4px 0;
    border-bottom: 1px solid #f1f5f9;
  }
  
  .item-content:last-child {
    border-bottom: none;
  }
  
  .item-actions {
    margin-top: 12px;
    justify-content: center;
  }
  
  .modal {
    width: 95vw;
    margin: 20px;
  }
}
</style>
