/**
 * 订阅项目服务
 * 处理项目订阅、取消订阅、获取订阅列表等功能
 */

class SubscriptionService {
  constructor() {
    this.baseURL = '/api/subscriptions'
    this.subscriptions = new Map() // 本地缓存订阅状态
  }

  /**
   * 获取用户订阅的项目列表
   * @param {Object} params - 查询参数
   * @param {string} params.status - 项目状态筛选
   * @param {string} params.search - 搜索关键词
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页数量
   * @returns {Promise<Object>} 订阅项目列表
   */
  async getSubscribedProjects(params = {}) {
    try {
      // 模拟API调用，实际应该发送HTTP请求
      const mockData = {
        success: true,
        data: {
          projects: [
            {
              id: 1,
              name: '智慧城市数据平台',
              manager: '张三',
              status: '进行中',
              startDate: '2024-01-01',
              endDate: '2024-06-30',
              description: '构建智慧城市综合数据管理平台，整合各部门数据资源，提供统一的数据服务接口。',
              progress: 65,
              subscriptionDate: '2024-01-15',
              notificationEnabled: true,
              location: {
                center: [113.2644, 23.1291],
                zoom: 12
              }
            },
            {
              id: 2,
              name: '城市交通优化系统',
              manager: '李四',
              status: '规划中',
              startDate: '2024-03-01',
              endDate: '2024-09-30',
              description: '基于大数据分析的城市交通流量优化系统，提高道路通行效率。',
              progress: 25,
              subscriptionDate: '2024-02-20',
              notificationEnabled: false,
              location: {
                center: [113.2644, 23.1291],
                zoom: 12
              }
            },
            {
              id: 3,
              name: '环境监测网络',
              manager: '王五',
              status: '已完成',
              startDate: '2023-09-01',
              endDate: '2024-01-31',
              description: '建设覆盖全市的环境监测传感器网络，实时监控空气质量、噪音等环境指标。',
              progress: 100,
              subscriptionDate: '2023-10-10',
              notificationEnabled: true,
              location: {
                center: [113.2644, 23.1291],
                zoom: 12
              }
            },
            {
              id: 4,
              name: '公共安全预警系统',
              manager: '赵六',
              status: '已延期',
              startDate: '2023-12-01',
              endDate: '2024-05-31',
              description: '集成视频监控、人员识别、异常行为检测的公共安全预警系统。',
              progress: 40,
              subscriptionDate: '2024-01-05',
              notificationEnabled: true,
              location: {
                center: [113.2644, 23.1291],
                zoom: 12
              }
            }
          ],
          total: 4,
          page: params.page || 1,
          limit: params.limit || 10
        }
      }

      // 应用筛选条件
      let filteredProjects = mockData.data.projects
      
      if (params.status && params.status !== 'all') {
        filteredProjects = filteredProjects.filter(p => p.status === params.status)
      }
      
      if (params.search) {
        const searchLower = params.search.toLowerCase()
        filteredProjects = filteredProjects.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.manager.toLowerCase().includes(searchLower)
        )
      }

      // 更新本地缓存
      filteredProjects.forEach(project => {
        this.subscriptions.set(project.id, {
          subscribed: true,
          subscriptionDate: project.subscriptionDate,
          notificationEnabled: project.notificationEnabled
        })
      })

      return {
        ...mockData,
        data: {
          ...mockData.data,
          projects: filteredProjects,
          total: filteredProjects.length
        }
      }
    } catch (error) {
      console.error('获取订阅项目失败:', error)
      throw new Error('获取订阅项目失败')
    }
  }

  /**
   * 订阅项目
   * @param {number|string} projectId - 项目ID
   * @param {Object} options - 订阅选项
   * @param {boolean} options.enableNotification - 是否启用通知
   * @returns {Promise<Object>} 订阅结果
   */
  async subscribeProject(projectId, options = {}) {
    try {
      // 模拟API调用
      const response = {
        success: true,
        message: '订阅成功',
        data: {
          projectId,
          subscriptionDate: new Date().toISOString().split('T')[0],
          notificationEnabled: options.enableNotification !== false
        }
      }

      // 更新本地缓存
      this.subscriptions.set(projectId, {
        subscribed: true,
        subscriptionDate: response.data.subscriptionDate,
        notificationEnabled: response.data.notificationEnabled
      })

      return response
    } catch (error) {
      console.error('订阅项目失败:', error)
      throw new Error('订阅项目失败')
    }
  }

  /**
   * 取消订阅项目
   * @param {number|string} projectId - 项目ID
   * @returns {Promise<Object>} 取消订阅结果
   */
  async unsubscribeProject(projectId) {
    try {
      // 模拟API调用
      const response = {
        success: true,
        message: '取消订阅成功',
        data: {
          projectId
        }
      }

      // 更新本地缓存
      this.subscriptions.delete(projectId)

      return response
    } catch (error) {
      console.error('取消订阅失败:', error)
      throw new Error('取消订阅失败')
    }
  }

  /**
   * 检查项目是否已订阅
   * @param {number|string} projectId - 项目ID
   * @returns {Promise<boolean>} 是否已订阅
   */
  async isProjectSubscribed(projectId) {
    try {
      // 先检查本地缓存
      if (this.subscriptions.has(projectId)) {
        return this.subscriptions.get(projectId).subscribed
      }

      // 模拟API调用检查订阅状态
      const response = {
        success: true,
        data: {
          subscribed: false // 默认未订阅
        }
      }

      return response.data.subscribed
    } catch (error) {
      console.error('检查订阅状态失败:', error)
      return false
    }
  }

  /**
   * 更新通知设置
   * @param {number|string} projectId - 项目ID
   * @param {boolean} enabled - 是否启用通知
   * @returns {Promise<Object>} 更新结果
   */
  async updateNotificationSettings(projectId, enabled) {
    try {
      // 模拟API调用
      const response = {
        success: true,
        message: enabled ? '已开启通知' : '已关闭通知',
        data: {
          projectId,
          notificationEnabled: enabled
        }
      }

      // 更新本地缓存
      if (this.subscriptions.has(projectId)) {
        const subscription = this.subscriptions.get(projectId)
        subscription.notificationEnabled = enabled
        this.subscriptions.set(projectId, subscription)
      }

      return response
    } catch (error) {
      console.error('更新通知设置失败:', error)
      throw new Error('更新通知设置失败')
    }
  }

  /**
   * 获取订阅统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getSubscriptionStats() {
    try {
      // 模拟API调用
      const response = {
        success: true,
        data: {
          totalSubscriptions: 4,
          activeProjects: 1,
          completedProjects: 1,
          delayedProjects: 1,
          planningProjects: 1,
          notificationEnabled: 3
        }
      }

      return response
    } catch (error) {
      console.error('获取订阅统计失败:', error)
      throw new Error('获取订阅统计失败')
    }
  }

  /**
   * 批量操作订阅
   * @param {Array} projectIds - 项目ID数组
   * @param {string} action - 操作类型 ('subscribe' | 'unsubscribe')
   * @returns {Promise<Object>} 批量操作结果
   */
  async batchSubscriptionOperation(projectIds, action) {
    try {
      const results = []
      
      for (const projectId of projectIds) {
        if (action === 'subscribe') {
          const result = await this.subscribeProject(projectId)
          results.push({ projectId, success: result.success })
        } else if (action === 'unsubscribe') {
          const result = await this.unsubscribeProject(projectId)
          results.push({ projectId, success: result.success })
        }
      }

      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount

      return {
        success: failCount === 0,
        message: `成功处理 ${successCount} 个项目${failCount > 0 ? `，失败 ${failCount} 个` : ''}`,
        data: {
          results,
          successCount,
          failCount
        }
      }
    } catch (error) {
      console.error('批量操作失败:', error)
      throw new Error('批量操作失败')
    }
  }

  /**
   * 清空本地缓存
   */
  clearCache() {
    this.subscriptions.clear()
  }

  /**
   * 获取本地缓存的订阅状态
   * @param {number|string} projectId - 项目ID
   * @returns {Object|null} 订阅信息
   */
  getCachedSubscription(projectId) {
    return this.subscriptions.get(projectId) || null
  }
}

// 创建单例实例
export const subscriptionService = new SubscriptionService()
export default subscriptionService