import { findAndUpdate } from '../utility/index.js'
export const transformAction = ({ root, j }, { vuexProperties }) => {
    let actionSyntax = ''
    let actions = root.find(j.VariableDeclarator, {
        id: {
            name: 'actions',
        },
    })
    if (!actions.length) {
        return actionSyntax
    }
    actions = actions.get()
    // remove commits, actions, getters and others from params
    actions.value.init.properties.forEach((action) => {
        if (action.value.params?.length) {
            action.value.params.shift()
        }
    })
    root.find(j.VariableDeclarator, {
        id: {
            name: 'mutations',
        },
    }).forEach((path) => {
        path.value.init.properties.forEach((property) => {
            findAndUpdate(
                vuexProperties.mutationNames,
                (value) => value.name === property.key.name,
                (found) => {
                    property.key.name = found.value.newName
                }
            ),
                actions.value.init.properties.unshift(property)
        })
    })

    actionSyntax = j(actions.value.init).toSource()
    return actionSyntax
}
