<template>
  <form @submit.prevent="submitSuggestion" class="suggestion-form">
    <!-- 建议标题输入框 -->
    <div class="form-group">
      <label for="title">建议标题</label>
      <input
        type="text"
        id="title"
        v-model="suggestion.title"
        placeholder="请输入建议标题"
        required
      />
    </div>

    <!-- 建议内容输入框 -->
    <div class="form-group">
      <label for="content">建议内容</label>
      <textarea
        id="content"
        v-model="suggestion.content"
        placeholder="请输入您的建议内容"
        required
      ></textarea>
    </div>

    <!-- 提交按钮 -->
    <button type="submit" class="submit-btn">提交建议</button>
  </form>
</template>

<script>
export default {
  name: 'SuggestionForm',
  data() {
    return {
      // 存储建议信息的对象
      suggestion: {
        title: '',
        content: ''
      }
    };
  },
  methods: {
    // 提交建议的方法
    submitSuggestion() {
      // 这里可以添加提交建议的逻辑，例如调用 API
      console.log('提交的建议:', this.suggestion);
      // 提交成功后清空表单
      this.suggestion = {
        title: '',
        content: ''
      };
      // 可以在这里添加提示信息，例如使用消息弹窗
      alert('建议提交成功！');
    }
  }
};
</script>

<style scoped>
.suggestion-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-group textarea {
  height: 120px;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #45a049;
}
</style>
