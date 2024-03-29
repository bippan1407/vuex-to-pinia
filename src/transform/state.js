export const transformState = ({ root, j }) => {
    let stateSyntax = ''
    const rootNode = root.get()
    let stateNode = rootNode.value.program.body.find((value) => {
        console.log(value)
        if (
            value?.declaration?.declarations?.[0]?.id?.name === 'state' ||
            value?.declarations?.[0]?.id?.name === 'state'
        ) {
            return true
        }
    })
    if (stateNode && stateNode?.declaration?.declarations[0]) {
        stateNode = stateNode.declaration.declarations[0]
    } else if (stateNode && stateNode?.declarations[0]) {
        stateNode = stateNode.declarations[0]
    } else {
        return stateSyntax
    }
    stateSyntax = j(stateNode.init).toSource()
    return stateSyntax
}
