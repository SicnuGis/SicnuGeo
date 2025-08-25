<template>
  <div class="project-admin">
    <div class="admin-header">
      <h1>项目管理</h1>
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
      <div v-for="project in projects" :key="project.id" class="project-item">
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
          <button @click="showDetail = false">关闭</button>
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
              <p>{{ selectedProject.description }}</p>
            </div>
            <div class="detail-section">
              <h3>项目进度</h3>
              <ProjectTimeLine :project-id="selectedProject.id" />
            </div>
            <div class="detail-section">
              <h3>项目位置</h3>
              <CesiumViewer :location="selectedProject.location" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑项目表单 -->
    <div v-if="showForm" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditing ? '编辑项目' : '添加新项目' }}</h2>
          <button @click="showForm = false">关闭</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitProjectForm">
            <div class="form-group">
              <label for="projectName">项目名称</label>
              <input type="text" id="projectName" v-model="formData.name" required>
            </div>
            <div class="form-group">
              <label for="projectManager">负责人</label>
              <input type="text" id="projectManager" v-model="formData.manager" required>
            </div>
            <div class="form-group">
              <label for="projectStatus">状态</label>
              <select id="projectStatus" v-model="formData.status" required>
                <option value="planning">规划中</option>
                <option value="inProgress">进行中</option>
                <option value="completed">已完成</option>
                <option value="onHold">暂停</option>
              </select>
            </div>
            <div class="form-group">
              <label for="projectStartDate">开始日期</label>
              <input type="date" id="projectStartDate" v-model="formData.startDate" required>
            </div>
            <div class="form-group">
              <label for="projectEndDate">结束日期</label>
              <input type="date" id="projectEndDate" v-model="formData.endDate" required>
            </div>
            <div class="form-group">
              <label for="projectDescription">项目描述</label>
              <textarea id="projectDescription" v-model="formData.description"></textarea>
            </div>
            <div class="form-group">
              <label for="projectLocation">项目位置</label>
              <div class="location-picker">
                <CesiumViewer @location-selected="onLocationSelected" />
                <input type="text" id="projectLocation" v-model="formData.location" readonly>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-submit">{{ isEditing ? '更新' : '创建' }}</button>
              <button type="button" @click="showForm = false">取消</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ProjectTimeLine from '@/components/charts/ProjectTimeLine.vue';
import CesiumViewer from '@/components/CesiumViewer.vue';
import projectService from '@/services/project.service';

export default defineComponent({
  name: 'ProjectAdmin',
  components: {
    ProjectTimeLine,
    CesiumViewer
  },
  setup() {
    const router = useRouter();
    const projects = ref([]);
    const showDetail = ref(false);
    const showForm = ref(false);
    const isEditing = ref(false);
    const selectedProject = ref(null);
    const formData = ref({
      name: '',
      manager: '',
      status: 'planning',
      startDate: '',
      endDate: '',
      description: '',
      location: ''
    });

    // 加载项目列表
    const loadProjects = async () => {
      try {
        const data = await projectService.getAllProjects();
        projects.value = data;
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    };

    // 查看项目详情
    const viewProjectDetail = async (id) => {
      try {
        const data = await projectService.getProjectById(id);
        selectedProject.value = data;
        showDetail.value = true;
      } catch (error) {
        console.error('Failed to load project detail:', error);
      }
    };

    // 显示添加项目表单
    const showAddProjectForm = () => {
      isEditing.value = false;
      formData.value = {
        name: '',
        manager: '',
        status: 'planning',
        startDate: '',
        endDate: '',
        description: '',
        location: ''
      };
      showForm.value = true;
    };

    // 编辑项目
    const editProject = async (id) => {
      try {
        const data = await projectService.getProjectById(id);
        formData.value = {
          name: data.name,
          manager: data.manager,
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate,
          description: data.description,
          location: data.location
        };
        isEditing.value = true;
        selectedProject.value = data;
        showForm.value = true;
      } catch (error) {
        console.error('Failed to load project for editing:', error);
      }
    };

    // 删除项目
    const deleteProject = async (id) => {
      if (confirm('确定要删除这个项目吗？')) {
        try {
          await projectService.deleteProject(id);
          // 重新加载项目列表
          loadProjects();
        } catch (error) {
          console.error('Failed to delete project:', error);
        }
      }
    };

    // 提交项目表单
    const submitProjectForm = async () => {
      try {
        if (isEditing.value && selectedProject.value) {
          await projectService.updateProject(selectedProject.value.id, formData.value);
        } else {
          await projectService.createProject(formData.value);
        }
        showForm.value = false;
        // 重新加载项目列表
        loadProjects();
      } catch (error) {
        console.error('Failed to submit project form:', error);
      }
    };

    // 处理位置选择
    const onLocationSelected = (location) => {
      formData.value.location = location;
    };

    // 组件挂载时加载项目列表
    onMounted(() => {
      loadProjects();
    });

    return {
      projects,
      showDetail,
      showForm,
      isEditing,
      selectedProject,
      formData,
      loadProjects,
      viewProjectDetail,
      showAddProjectForm,
      editProject,
      deleteProject,
      submitProjectForm,
      onLocationSelected
    };
  }
});
</script>

<style scoped>
.project-admin {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-add-project {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.project-list {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.project-list-header {
  display: flex;
  background-color: #f2f2f2;
  font-weight: bold;
}

.header-item {
  flex: 1;
  padding: 12px;
  text-align: left;
}

.project-item {
  display: flex;
  border-bottom: 1px solid #ddd;
  transition: background-color 0.2s;
}

.project-item:hover {
  background-color: #f9f9f9;
}

.item-content {
  flex: 1;
  padding: 12px;
}

.item-actions {
  padding: 12px;
  display: flex;
  gap: 8px;
}

.item-actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.item-actions button:nth-child(1) {
  background-color: #2196F3;
  color: white;
}

.item-actions button:nth-child(2) {
  background-color: #FFC107;
  color: black;
}

.item-actions button:nth-child(3) {
  background-color: #F44336;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ddd;
}

.modal-header button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 16px;
}

.project-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section h3 {
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
  margin-top: 0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-planning {
  background-color: #FFC107;
  color: black;
}

.status-inProgress {
  background-color: #2196F3;
  color: white;
}

.status-completed {
  background-color: #4CAF50;
  color: white;
}

.status-onHold {
  background-color: #F44336;
  color: white;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-group textarea {
  min-height: 100px;
}

.location-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.location-picker .cesium-viewer {
  height: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}

.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit {
  background-color: #4CAF50;
  color: white;
}
</style>
