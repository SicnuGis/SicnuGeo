import { defineStore } from 'pinia';

// 定义一个名为 suggestion 的 store
export const useSuggestionStore = defineStore('suggestion', {
  state: () => ({
    // 存储建议列表
    suggestions: [],
    // 存储当前选中的建议
    selectedSuggestion: null,
  }),
  getters: {
    // 获取所有建议
    getAllSuggestions: (state) => state.suggestions,
    // 获取当前选中的建议
    getSelectedSuggestion: (state) => state.selectedSuggestion,
  },
  actions: {
    // 设置建议列表
    setSuggestions(newSuggestions) {
      this.suggestions = newSuggestions;
    },
    // 设置当前选中的建议
    setSelectedSuggestion(suggestion) {
      this.selectedSuggestion = suggestion;
    },
    // 清空建议列表
    clearSuggestions() {
      this.suggestions = [];
      this.selectedSuggestion = null;
    },
  },
});
