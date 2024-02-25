export const transformState = ({ root, j }) => {
    let stateSyntax = ''
    root.find(j.VariableDeclarator, {
        id: {
            name: 'state',
        },
    }).forEach((path) => {
        stateSyntax = j(path.value.init).toSource()
    })
    return stateSyntax
}
