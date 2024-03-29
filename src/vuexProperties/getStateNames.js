const getStateNames = ({ j, root }) => {
    const stateNameService = StateNamesService()
    const rootNode = root.get()
    let stateNode = rootNode.value.program.body.find((value) => {
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
        return stateNameService.getNames()
    }
    stateNode.init.body.properties.forEach((property) => {
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
