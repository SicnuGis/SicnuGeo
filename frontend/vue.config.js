const fs = require('fs')
const path = require('path')

module.exports = {
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      // 模拟API路由
      devServer.app.get('/api/projects', (req, res) => {
        const filePath = path.join(__dirname, 'mock', 'projects.json')
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            res.status(500).json({ error: 'Failed to read mock data' })
            return
          }
          res.json(JSON.parse(data))
        })
      })

      return middlewares
    }
  }
}