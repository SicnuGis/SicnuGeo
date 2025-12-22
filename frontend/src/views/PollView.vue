<template>
  <div class="poll-view">
    <h1>投票页面</h1>
    <div v-if="polls.length > 0">
      <div v-for="(poll, index) in polls" :key="index" class="poll-item">
        <h2>{{ poll.question }}</h2>
        <ul>
          <li v-for="(option, optIndex) in poll.options" :key="optIndex">
            <label>
              <input
                type="radio"
                :name="'poll_' + index"
                :value="optIndex"
                v-model="selectedOptions[index]"
              />
              {{ option }}
            </label>
          </li>
        </ul>
        <button @click="submitPoll(index)">提交</button>
      </div>
    </div>
    <div v-else>
      <p>暂无投票内容</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PollView',
  data() {
    return {
      polls: [
        {
          question: '你最喜欢的颜色是？',
          options: ['红色', '蓝色', '绿色', '黄色']
        },
        {
          question: '你最喜欢的水果是？',
          options: ['苹果', '香蕉', '橙子', '葡萄']
        }
      ],
      selectedOptions: []
    }
  },
  methods: {
    submitPoll(index) {
      if (this.selectedOptions[index] !== undefined) {
        alert(`你对问题 "${this.polls[index].question}" 选择了选项 ${this.polls[index].options[this.selectedOptions[index]]}`)
        // 这里可以添加实际提交投票的逻辑，比如调用 API
      } else {
        alert('请先选择一个选项再提交！')
      }
    }
  }
}
</script>

<style scoped>
.poll-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.poll-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.poll-item h2 {
  margin-top: 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 8px;
}

button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #3aa876;
}
</style>
