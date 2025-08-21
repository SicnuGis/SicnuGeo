// 以下是一个简单的用户存储类示例
class UserStore {
    constructor() {
        // 初始化用户数据
        this.users = [];
    }

    // 添加用户
    addUser(user) {
        this.users.push(user);
    }

    // 根据 ID 获取用户
    getUserById(id) {
        return this.users.find(user => user.id === id);
    }

    // 获取所有用户
    getAllUsers() {
        return this.users;
    }

    // 根据 ID 删除用户
    deleteUserById(id) {
        this.users = this.users.filter(user => user.id !== id);
    }
}

// 导出 UserStore 类
export default UserStore;
