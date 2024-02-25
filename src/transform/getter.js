export const transformGetter = ({ root, j }) => {
    let getterSyntax = ''
    root.find(j.VariableDeclarator, {
        id: {
            name: 'getters',
        },
    }).forEach((path) => {
        getterSyntax = j(path.value.init).toSource()
    })
    return getterSyntax
}
