<template>
  <div class="project-admin-container">
    <div class="header">
      <h2>项目管理</h2>
      <button class="add-btn" @click="goCreate" v-if="isGovernment">添加项目</button>
    </div>

    <!-- 项目列表 -->
    <div class="project-list">
      <el-table :data="projects" style="width: 100%">
        <el-table-column prop="id" label="项目ID" width="80"></el-table-column>
        <el-table-column prop="name" label="项目名称" width="200"></el-table-column>
        <el-table-column label="项目分类" width="120">
          <template #default="scope">
            <span v-if="scope.row.category">
              {{ getCategoryLabel(scope.row.category) }}
            </span>
            <span v-else class="text-muted">未分类</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="项目描述"></el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="120"></el-table-column>
        <el-table-column prop="endDate" label="结束日期" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="100"></el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewProject(scope.row.id)">查看</el-button>
            <el-button v-if="isGovernment" size="small" type="primary" @click="editProject(scope.row.id)">编辑</el-button>
            <el-button v-if="isGovernment" size="small" type="danger" @click="deleteProject(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑项目对话框 -->
    <el-dialog v-model="showAddDialog" :title="isEditing ? '编辑项目' : '添加项目'" width="500px">
      <el-form :model="formData" ref="formRef" label-width="100px">
        <el-form-item label="项目名称" prop="name" :rules="[{ required: true, message: '请输入项目名称' }]">
          <el-input v-model="formData.name"></el-input>
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input v-model="formData.description" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate" :rules="[{ required: true, message: '请选择开始日期' }]">
          <el-date-picker v-model="formData.startDate" type="date"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate" :rules="[{ required: true, message: '请选择结束日期' }]">
          <el-date-picker v-model="formData.endDate" type="date"></el-date-picker>
        </el-form-item>
        <el-form-item label="项目分类" prop="category" :rules="[{ required: true, message: '请选择项目分类' }]">
          <el-select v-model="formData.category" placeholder="请选择项目分类">
            <el-option 
              v-for="category in categories" 
              :key="category.value" 
              :label="category.label" 
              :value="category.value"
            >
              <span :style="{ color: category.color }">{{ category.icon }}</span>
              {{ category.label }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="manager" :rules="[{ required: true, message: '请输入负责人姓名' }]">
          <el-input v-model="formData.manager" placeholder="请输入负责人姓名"></el-input>
        </el-form-item>
        <el-form-item label="项目地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入项目地址"></el-input>
        </el-form-item>
        <el-form-item label="投资金额" prop="investment">
          <el-input-number v-model="formData.investment" :min="0" :step="1000" placeholder="万元"></el-input-number>
        </el-form-item>
        <el-form-item label="项目书" prop="documents">
          <el-upload
            class="upload-demo"
            :action="uploadUrl"
            :on-success="handleDocumentSuccess"
            :on-remove="handleDocumentRemove"
            :file-list="formData.documents"
            accept=".pdf,.doc,.docx"
            :limit="3"
          >
            <el-button size="small" type="primary">上传项目书</el-button>
            <template #tip>
              <div class="el-upload__tip">只能上传PDF/Word文件，且不超过10MB</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="SHP文件" prop="shpFiles">
          <el-upload
            class="upload-demo"
            :action="uploadUrl"
            :on-success="handleShpSuccess"
            :on-remove="handleShpRemove"
            :file-list="formData.shpFiles"
            accept=".shp,.shx,.dbf,.prj"
            multiple
            :limit="10"
          >
            <el-button size="small" type="primary">上传SHP文件</el-button>
            <template #tip>
              <div class="el-upload__tip">请上传完整的SHP文件集（.shp, .shx, .dbf, .prj等）</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="项目状态" prop="status">
          <el-select v-model="formData.status">
            <el-option label="规划中" value="planning"></el-option>
            <el-option label="未开始" value="notStarted"></el-option>
            <el-option label="进行中" value="inProgress"></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="已延期" value="delayed"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { projectService } from '@/services/project.service'
import { getAllCategoryOptions } from '@/services/category.service'
import { useUserStore } from '@/store/index'

export default {
  data() {
    return {
      projects: [],
      showAddDialog: false,
      isEditing: false,
      categories: [],
      uploadUrl: '/api/upload', // 文件上传接口
      formData: {
        id: '',
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'planning',
        category: '',
        manager: '',
        address: '',
        investment: 0,
        documents: [],
        shpFiles: []
      }
    }
  },
      userStore: null
    }
  },
  computed: {
    isGovernment() {
      return this.userStore && this.userStore.isGovernment
    }
  },
  mounted() {
    this.userStore = useUserStore()
    this.loadCategories()
    this.loadProjects()
  },
  methods: {
    loadCategories() {
      this.categories = getAllCategoryOptions()
    },
    
    getCategoryLabel(categoryValue) {
      const category = this.categories.find(c => c.value === categoryValue)
      return category ? category.label : categoryValue
    },
    
    async loadProjects() {
      try {
        const data = await projectService.getAllProjects()
        this.projects = data
        this.$store && this.$store.dispatch && this.$store.dispatch('setProjects', data)
      } catch (error) {
        console.error('加载项目列表失败:', error)
        this.$message && this.$message.error && this.$message.error('加载项目列表失败')
      }
    },
    viewProject(id) {
      this.$router.push({ name: 'ProjectDetail', params: { id } })
    },
    goCreate() {
      this.$router.push({ name: 'ProjectCreate' })
    },
    editProject(id) {
      this.$router.push({ name: 'ProjectEdit', params: { id } })
    },
    async deleteProject(id) {
      try {
        await projectService.deleteProject(id)
        // 更新本地数据
        this.projects = this.projects.filter(project => project.id !== id)
        // 更新Vuex store
        this.$store.dispatch('deleteProjectById', id)
        this.$message.success('项目删除成功')
      } catch (error) {
        console.error('删除项目失败:', error)
        this.$message.error('删除项目失败')
      }
    },
    async submitForm() {
      try {
        await this.$refs.formRef.validate()

        if (this.isEditing) {
          // 编辑项目
          await projectService.updateProject(this.formData.id, this.formData)
          // 更新本地数据
          const index = this.projects.findIndex(project => project.id === this.formData.id)
          if (index !== -1) {
            this.projects[index] = { ...this.formData }
          }
          // 更新Vuex store
          this.$store.dispatch('updateProjectById', {
            id: this.formData.id,
            updatedData: this.formData
          })
          this.$message.success('项目更新成功')
        } else {
          // 添加项目
          const newProject = await projectService.createProject(this.formData)
          // 更新本地数据
          this.projects.push(newProject)
          // 更新Vuex store
          this.$store.dispatch('addProject', newProject)
          this.$message.success('项目添加成功')
        }

        // 关闭对话框
        this.showAddDialog = false
        // 重置表单
        this.resetForm()
      } catch (error) {
        console.error('提交表单失败:', error)
        if (error.name === 'ValidationError') {
          return
        }
        this.$message.error('操作失败，请重试')
      }
    },
    resetForm() {
      this.$refs.formRef.resetFields()
      this.formData = {
        id: '',
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'planning',
        category: '',
        manager: '',
        address: '',
        investment: 0,
        documents: [],
        shpFiles: []
      }
      this.isEditing = false
    },

    // 文件上传处理方法
    handleDocumentSuccess(response, file, fileList) {
      this.formData.documents = fileList.map(f => ({
        name: f.name,
        type: 'project_proposal',
        uploadTime: new Date().toISOString(),
        url: f.response?.url || f.url
      }))
    },

    handleDocumentRemove(file, fileList) {
      this.formData.documents = fileList.map(f => ({
        name: f.name,
        type: 'project_proposal',
        uploadTime: new Date().toISOString(),
        url: f.response?.url || f.url
      }))
    },

    handleShpSuccess(response, file, fileList) {
      this.formData.shpFiles = fileList.map(f => ({
        name: f.name,
        uploadTime: new Date().toISOString(),
        url: f.response?.url || f.url
      }))
    },

    handleShpRemove(file, fileList) {
      this.formData.shpFiles = fileList.map(f => ({
        name: f.name,
        uploadTime: new Date().toISOString(),
        url: f.response?.url || f.url
      }))
    }
  }
}
</script>

<style scoped>
.project-admin-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-btn {
  padding: 8px 16px;
  background-color: #4096ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.project-list {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}
</style>