// 测试API连接 - 适合Vite环境（ESM）
import axios from 'axios'

// 直接测试API连接，不依赖store
async function testGetAllProjects() {
  try {
    console.log('测试获取项目列表...')
    // 创建axios实例，模拟项目中的API调用
    const api = axios.create({
      baseURL: 'http://localhost:8080/api',
      timeout: 5000
    })

    const response = await api.get('/projects')
    console.log('获取成功，项目数量:', Array.isArray(response.data) ? response.data.length : 'N/A')
    console.log('项目列表:', response.data)
  } catch (error) {
    console.error('获取项目列表失败:', error.message)
    // 打印错误详情
    if (error.response) {
      console.error('响应状态:', error.response.status)
      console.error('响应数据:', error.response.data)
    } else if (error.request) {
      console.error('没有收到响应')
    } else {
      console.error('请求错误:', error.message)
    }
    throw error
  }
}

// 运行
// 创建一个立即执行的异步函数来运行测试
(async () => {
  await testGetAllProjects()
})()
