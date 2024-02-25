const changeMutationNamesIfExistsInActions = (json) => {
    const mutationNames = json['mutationNames']
    const actionNames = json['actionNames']
    mutationNames.forEach((mutation) => {
        const actionIndex = actionNames.findIndex(
            (action) => action.name === mutation.name
        )
        let newName = ''
        if (actionIndex !== -1) {
            newName = `${mutation.name}Mutation`
        } else {
            newName = mutation.name
        }
        mutation.newName = newName
    })
    return json
}

const changePropertiesWithSameName = (json) => {
    const propertiesToIterate = [
        'stateNames',
        'mutationNames',
        'actionNames',
        'getterNames',
    ]

    propertiesToIterate.forEach((name) => {
        if (name === 'stateNames') {
            json[name].forEach((value) => {
                findAndUpdate(json, 'actionNames', value.name, 'Action')
                findAndUpdate(json, 'getterNames', value.name, 'Getter')
            })
        } else if (name === 'actions') {
            json[name].forEach((value) => {
                findAndUpdate(json, 'getterNames', value.name, 'Getter')
            })
        }
    })
    propertiesToIterate.forEach((name) => {
        json[name].forEach((value) => {
            if (!value.newName) {
                value.newName = value.name
            }
        })
    })
    return json
}

const findAndUpdate = (
    json,
    propertyName,
    propertyNameToCheck,
    postFix = ''
) => {
    const infoArr = json[propertyName]
    const foundIndex = infoArr.findIndex(
        (property) => property.name === propertyNameToCheck
    )
    let newName = ''
    if (foundIndex !== -1) {
        newName = infoArr[foundIndex].name + postFix
        infoArr[foundIndex].newName = newName
    }
}

const analyseAndUpdate = (json) => {
    json = changeMutationNamesIfExistsInActions(json)
    json = changePropertiesWithSameName(json)
    return json
}

export { analyseAndUpdate }
