<template>
  <div class="suggestion-mgr">
    <h1>建议管理</h1>
    <!-- 建议列表 -->
    <ul>
      <li v-for="suggestion in suggestions" :key="suggestion.id">
        {{ suggestion.content }} - {{ suggestion.author }}
      </li>
    </ul>
    <!-- 添加建议表单 -->
    <form @submit.prevent="addSuggestion">
      <input v-model="newSuggestion" placeholder="输入你的建议" required />
      <button type="submit">提交</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'SuggestionMgr',
  data() {
    return {
      suggestions: [
        { id: 1, content: '增加搜索功能', author: '用户A' },
        { id: 2, content: '优化界面设计', author: '用户B' }
      ],
      newSuggestion: ''
    }
  },
  methods: {
    addSuggestion() {
      if (this.newSuggestion.trim()) {
        this.suggestions.push({
          id: Date.now(),
          content: this.newSuggestion,
          author: '匿名用户'
        })
        this.newSuggestion = ''
      }
    }
  }
}
</script>

<style scoped>
.suggestion-mgr {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  padding: 10px;
  margin: 5px 0;
  background-color: #f5f5f5;
  border-radius: 4px;
}
input {
  padding: 8px;
  width: 70%;
  margin-right: 10px;
}
button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #33a06f;
}
</style>
