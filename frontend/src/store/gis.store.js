// 由于指令仅要求“写出此类的代码”，但未明确具体类的类型，以下给出一个简单的 JavaScript 类示例
class GisStore {
    constructor() {
        this.data = [];
    }

    // 添加数据的方法
    addData(item) {
        this.data.push(item);
    }

    // 获取所有数据的方法
    getAllData() {
        return this.data;
    }
}

// 导出类以便其他模块使用
export default GisStore;
