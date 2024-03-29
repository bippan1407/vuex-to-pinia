import { useUserStore } from "~/store/user";
import { useStudentsStore } from "~/store/students";
import { useSubjectsStore } from "~/store/subjects";
import { defineStore, storeToRefs } from "pinia";
const getInitialState = function () {
  return {
    name: 'tom'
  };
};
export const useInfoStore = defineStore('infoStore', {
  state: function () {
    return {
      subject: 'mechanical',
      ...getInitialState()
    };
  },
  actions: {
    updateSubjectMutation(state, newSubject) {
      this.subject = newSubject;
    },
    updateNameMutation(state, newName) {
      this.name = newName;
    },
    updateName: function ({
      newName
    }) {
      const userStore = useUserStore();
      const {
        newUser: newUser
      } = userStore;
      const studentsStore = useStudentsStore();
      const {
        name: name
      } = storeToRefs(studentsStore);
      const subjectsStore = useSubjectsStore();
      const {
        name: studentSubject
      } = storeToRefs(subjectsStore);
      const studentName = name.value;
      studentName.value = '1';
      if (this.name !== newName && this.getDefaultName && studentName && studentSubject.value) {
        this.updateNameApi(newName);
        //Nuxt3TODO Please review 
        newUser(newName);
        this.updateNameMutation(newName);
      }
    },
    async updateNameApi(payload) {
      const {
        $axios: $axios
      } = useNuxtApp();
      const {
        state,
        data
      } = await $axios.get(payload);
      if (state) {
        context.commit('updateName', data);
      }
    },
    updateSubject: function () {
      this.updateSubjectMutation('electrical');
    },
    getUser() {
      const {
        $axios: $axios
      } = useNuxtApp();
      $axios.$get('/get');
    },
    subject() {}
  },
  getters: {
    getNewName() {
      return this.name;
    },
    subjectGetter() {
      return this.subject;
    },
    getDefaultName: function () {
      return function () {
        return 'defaultName';
      };
    },
    getUserGetter() {
      return this.user;
    }
  }
});