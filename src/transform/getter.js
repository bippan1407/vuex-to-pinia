import { findAndUpdate } from '../utility/index.js'

export const transformGetter = ({ root, j }, { vuexProperties }) => {
    let getterSyntax = ''
    root.find(j.VariableDeclarator, {
        id: {
            name: 'getters',
        },
    }).forEach((path) => {
        path.value.init.properties.forEach((property) => {
            findAndUpdate(
                vuexProperties.getterNames,
                (value) => value.name === property.key.name,
                (found) => {
                    property.key.name = found.value.newName
                }
            )
            // remove commits, actions, getters and others from params
            if (property.value.params.length) {
                property.value.params.shift()
            }
        })
        getterSyntax = j(path.value.init).toSource()
    })
    return getterSyntax
}
