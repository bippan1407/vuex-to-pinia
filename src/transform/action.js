import { findAndUpdate } from '../utility/index.js'

export const transformAction = ({ root, j }, { vuexProperties }) => {
    let actionSyntax = ''
    let actions = root.find(j.VariableDeclarator, {
        id: {
            name: 'actions',
        },
    })
    actions = actions.get()
    root.find(j.VariableDeclarator, {
        id: {
            name: 'mutations',
        },
    }).forEach((path) => {
        path.value.init.properties.forEach((property) => {
            findAndUpdate(
                vuexProperties.actionNames,
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
