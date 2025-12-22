<template>
  <div class="forum-view">
    <h1>论坛页面</h1>
    <div class="post-list">
      <!-- 帖子列表 -->
      <div v-for="post in posts" :key="post.id" class="post-item">
        <h2>{{ post.title }}</h2>
        <p>{{ post.content }}</p>
        <span>{{ post.author }}</span>
        <span>{{ post.date }}</span>
      </div>
    </div>
    <form @submit.prevent="submitPost" class="post-form">
      <input v-model="newPost.title" placeholder="帖子标题" required />
      <textarea v-model="newPost.content" placeholder="帖子内容" required></textarea>
      <button type="submit">发布</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ForumView',
  data() {
    return {
      posts: [
        {
          id: 1,
          title: '欢迎来到论坛',
          content: '这是第一个帖子，欢迎大家交流！',
          author: '管理员',
          date: '2024-01-01'
        }
      ],
      newPost: {
        title: '',
        content: ''
      }
    }
  },
  methods: {
    submitPost() {
      const newId = this.posts.length > 0 ? Math.max(...this.posts.map(post => post.id)) + 1 : 1
      const post = {
        id: newId,
        ...this.newPost,
        author: '用户',
        date: new Date().toISOString().split('T')[0]
      }
      this.posts.push(post)
      this.newPost = { title: '', content: '' }
    }
  }
}
</script>

<style scoped>
.forum-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.post-list {
  margin-bottom: 20px;
}

.post-item {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.post-form {
  display: flex;
  flex-direction: column;
}

.post-form input,
.post-form textarea {
  margin-bottom: 10px;
  padding: 8px;
}

.post-form button {
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.post-form button:hover {
  background-color: #3aa876;
}
</style>
