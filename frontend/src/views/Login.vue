<template>
  <div class="login-container">
    <h2>请选择登录系统</h2>
    <div class="card-group">
      <div class="card" @click="login('government')">
        <h3>政府系统</h3>
        <p>可新建、编辑项目</p>
      </div>
      <div class="card" @click="login('normal')">
        <h3>普通系统</h3>
        <p>只能查看项目</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '@/store/index'

export default {
  name: 'LoginView',
  methods: {
    login(role) {
      const store = useUserStore()
      store.setCurrentUser({ id: 'u_demo', name: role === 'government' ? '政府用户' : '普通用户', role })
      store.setToken('demo-token')
      this.$router.push('/projects')
    }
  }
}
</script>

<style scoped>
.login-container { padding: 40px; text-align: center; }
.card-group { display:flex; justify-content:center; gap:20px; margin-top: 20px; }
.card { width:220px; padding:20px; border:1px solid #eee; border-radius:8px; cursor:pointer; }
.card:hover { box-shadow:0 2px 12px rgba(0,0,0,0.12); }
</style>