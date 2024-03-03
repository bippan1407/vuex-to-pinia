export const transformThisExpression = ({ root, j }, { vuexProperties }) => {
    root.find(j.VariableDeclarator, (path) => {
        if (['getters', 'mutations', 'actions'].includes(path.id.name)) {
            return true
        }
        return false
    })
        .find(j.MemberExpression, (path) => {
            if (['state', 'getters'].includes(path.object.name)) {
                return true
            }
            return false
        })
        .replaceWith((path) => {
            if (path?.value?.property?.name) {
                return `this.${path.value.property.name}`
            }
        })
}
