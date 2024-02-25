export const transformAction = ({ root, j }) => {
    let actionSyntax = ''
    root.find(j.VariableDeclarator, {
        id: {
            name: 'actions',
        },
    }).forEach((path) => {
        actionSyntax = j(path.value.init).toSource()
    })
    return actionSyntax
}
