// 建议存储类，用于管理建议相关状态
class SuggestionStore {
    constructor() {
        // 初始化建议数据
        this.suggestions = [];
        this.selectedSuggestion = null;
    }

    // 设置建议列表
    setSuggestions(newSuggestions) {
        this.suggestions = newSuggestions;
    }

    // 设置当前选中的建议
    setSelectedSuggestion(suggestion) {
        this.selectedSuggestion = suggestion;
    }

    // 清空建议列表
    clearSuggestions() {
        this.suggestions = [];
        this.selectedSuggestion = null;
    }

    // 获取所有建议
    getAllSuggestions() {
        return this.suggestions;
    }

    // 获取当前选中的建议
    getSelectedSuggestion() {
        return this.selectedSuggestion;
    }
}

// 导出 SuggestionStore 类
export default SuggestionStore;
