export const replaceProperty = ({ root, j }, syntaxToAdd) => {
    const propertiesToReplace = ['state', 'mutations', 'actions', 'getters']

    propertiesToReplace.forEach((property) => {
        console.log(property)
        root.find(j.VariableDeclaration, (path) => {
            if (propertiesToReplace.includes(path.declarations[0].id.name)) {
                return true
            }
            return false
        }).forEach((path) => {
            if (path?.parent?.value?.type === 'ExportNamedDeclaration') {
                j(path.parent).replaceWith('')
            } else {
                j(path).replaceWith('')
            }
        })
    })

    root.find(j.Program).forEach((path) => {
        const body = j(path).get('body')
        body.unshift("import { defineStore } from 'pinia';\n")
        body.push(syntaxToAdd)
    })
}
