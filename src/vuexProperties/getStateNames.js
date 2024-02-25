const getStateNames = ({ j, root }) => {
    const stateNameService = StateNamesService()

    root.find(j.VariableDeclarator, {
        id: {
            type: 'Identifier',
            name: 'state',
        },
    }).forEach((path) => {
        path.value.init.body.properties.forEach((property) => {
            const type = property.type
            if (property.type === 'Property') {
                stateNameService.addName({ name: property.key.name, type })
            } else if (property.type === 'SpreadElement') {
                if (property.argument.type === 'Identifier') {
                    stateNameService.addName({
                        name: property.argument.name,
                        type,
                        argumentType: property.argument.type,
                    })
                } else if (property.argument.type === 'CallExpression') {
                    stateNameService.addName({
                        name: property.argument.callee.name,
                        type,
                        argumentType: property.argument.type,
                    })
                }
            }
        })
    })
    return stateNameService.getNames()
}

const StateNamesService = () => {
    const names = []

    const addName = ({ name, type, argumentType }) => {
        names.push({
            name,
            type,
            argumentType,
        })
    }

    const getNames = () => {
        return names
    }

    return {
        getNames,
        addName,
    }
}

export default getStateNames
