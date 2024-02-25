const getInitialState = () => ({
    name: 'tom',
})

const state = () => ({
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

const actions = {
    updateName(
        { commit, dispatch, state, getters, rootState, rootGetters },
        { newName }
    ) {
        const studentName = rootState['students/name']
        const studentSubject = rootGetters['subjects/name']
        if (
            state.name !== newName &&
            getters.getDefaultName &&
            studentName &&
            studentSubject
        ) {
            dispatch('updateNameApi', newName)
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
}

const getters = {
    getNewName(state) {
        return state.name
    },
    subject(state) {
        return state.subject
    },
    getDefaultName: (state) => () => {
        return 'defaultName'
    },
}

export { state, mutations, getters, actions }
