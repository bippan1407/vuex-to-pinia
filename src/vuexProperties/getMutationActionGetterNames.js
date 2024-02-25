const getMutationActionsGetterNames = ({ j, root }) => {
    const propertyService = PropertyNamesService()
    const requiredVariableDeclarator = [
        { name: 'mutations', keyName: 'mutationNames' },
        { name: 'actions', keyName: 'actionNames' },
        { name: 'getters', keyName: 'getterNames' },
    ]

    requiredVariableDeclarator.forEach((info) => {
        root.find(j.VariableDeclarator, {
            id: {
                name: info.name,
            },
        }).forEach((path) => {
            path.value.init.properties.forEach((property) => {
                if (property.type === 'Property') {
                    propertyService.addName(info.keyName, {
                        name: property.key.name,
                    })
                }
            })
        })
    })
    return propertyService.getNames()
}

const PropertyNamesService = () => {
    const names = {}

    const addName = (variableName, { name, type, argumentType }) => {
        if (names[variableName]) {
            names[variableName].push({
                name,
                type,
                argumentType,
            })
        } else {
            names[variableName] = [{ name, type, argumentType }]
        }
    }

    const getNames = () => {
        return names
    }

    return {
        getNames,
        addName,
    }
}
export default getMutationActionsGetterNames
