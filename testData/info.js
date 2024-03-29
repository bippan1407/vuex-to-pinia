const getInitialState = () => ({
    name: 'tom',
})

export const state = () => ({
    subject: 'mechanical',
    ...getInitialState(),
})

const mutations = {
    updateName(state, newName) {
        state.name = newName
    },
    updateSubject(state, newSubject) {
        state.subject = newSubject
    },
}

export const actions = {
    updateName: (
        { commit, dispatch, state, getters, rootState, rootGetters },
        { newName }
    ) => {
        const studentName = rootState['students/name']
        const studentSubject = rootGetters['subjects/name']
        studentName.value = '1'
        if (
            state.name !== newName &&
            getters.getDefaultName &&
            studentName &&
            studentSubject
        ) {
            dispatch('updateNameApi', newName)
            dispatch('user/newUser', newName, { root: true })
            commit('updateName', newName)
        }
    },
    async updateNameApi(context, payload) {
        const { state, data } = await this.$axios.get(payload)
        if (state) {
            context.commit('updateName', data)
        }
    },
    updateSubject: ({ commit }) => {
        commit('updateSubject', 'electrical')
    },
    getUser() {
        this.$axios.$get('/get')
    },
    subject() {},
}

export const getters = {
    getNewName(state) {
        return state.name
    },
    subject(state) {
        return state.subject
    },
    getDefaultName: (state) => () => {
        return 'defaultName'
    },
    getUser(state) {
        return state.user
    },
}
