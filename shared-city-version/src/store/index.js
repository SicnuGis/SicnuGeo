import Vue from 'vue';
import Vuex from 'vuex';
import UserStore from './user.store';
import ProjectStore from './project.store';
import GisStore from './gis.store';
import SuggestionStore from './suggestion.store';

Vue.use(Vuex);

// 初始化存储类
const userStore = new UserStore();
const projectStore = new ProjectStore();
const gisStore = new GisStore();
const suggestionStore = new SuggestionStore();

export default new Vuex.Store({
  state: {
    userStore,
    projectStore,
    gisStore,
    suggestionStore
  },
  mutations: {
    // 用户相关mutations
    addUser(state, user) {
      state.userStore.addUser(user);
    },
    deleteUserById(state, id) {
      state.userStore.deleteUserById(id);
    },

    // 项目相关mutations
    setProjects(state, projects) {
      state.projectStore.setProjects(projects);
    },
    addProject(state, project) {
      state.projectStore.addProject(project);
    },
    updateProjectById(state, { id, updatedData }) {
      state.projectStore.updateProjectById(id, updatedData);
    },
    deleteProjectById(state, id) {
      state.projectStore.deleteProjectById(id);
    },
    setSelectedProject(state, project) {
      state.projectStore.setSelectedProject(project);
    },
    subscribeProject(state, projectId) {
      state.projectStore.subscribeProject(projectId);
    },
    unsubscribeProject(state, projectId) {
      state.projectStore.unsubscribeProject(projectId);
    }
  },
  actions: {
    // 用户相关actions
    addUser({ commit }, user) {
      commit('addUser', user);
    },
    deleteUserById({ commit }, id) {
      commit('deleteUserById', id);
    },

    // 项目相关actions
    setProjects({ commit }, projects) {
      commit('setProjects', projects);
    },
    addProject({ commit }, project) {
      commit('addProject', project);
    },
    updateProjectById({ commit }, payload) {
      commit('updateProjectById', payload);
    },
    deleteProjectById({ commit }, id) {
      commit('deleteProjectById', id);
    },
    setSelectedProject({ commit }, project) {
      commit('setSelectedProject', project);
    },
    subscribeProject({ commit }, projectId) {
      commit('subscribeProject', projectId);
    },
    unsubscribeProject({ commit }, projectId) {
      commit('unsubscribeProject', projectId);
    }
  },
  getters: {
    // 用户相关getters
    getAllUsers: state => state.userStore.getAllUsers(),
    getUserById: state => id => state.userStore.getUserById(id),

    // 项目相关getters
    getAllProjects: state => state.projectStore.getAllProjects(),
    getProjectById: state => id => state.projectStore.getProjectById(id),
    getSelectedProject: state => state.projectStore.getSelectedProject(),
    isProjectSubscribed: state => id => state.projectStore.isSubscribed(id),
    getSubscribedProjects: state => state.projectStore.getSubscribedProjects()
  }
});
