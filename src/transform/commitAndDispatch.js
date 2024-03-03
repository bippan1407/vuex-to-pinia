import { capitalizeFirstLetter } from '../utility/index.js'

export const transformCommitDispatch = ({ root, j }, { vuexProperties }) => {
    const storeImports = new Set()
    const mutationNames = vuexProperties.mutationNames.map(
        (value) => value.name
    )
    const actionNames = vuexProperties.actionNames.map((value) => value.name)
    root.find(j.VariableDeclarator, {
        id: {
            name: 'actions',
            type: 'Identifier',
        },
    }).forEach((path) => {
        path.value.init.properties.forEach((property) => {
            const storeValues = {}
            // replace dispatch, commit and import other use pinia modules
            j(property)
                .find(j.CallExpression)
                .forEach((path) => {
                    if (
                        ['commit', 'dispatch'].includes(path.value.callee.name)
                    ) {
                        let isCommit = path.value.callee.name === 'commit'
                        let [funcName, args] = path?.value?.arguments ?? []

                        if (!funcName.value) {
                            path.value.comments = [
                                j.commentLine('Nuxt3TODO store ', false, true),
                            ]
                            return
                        }
                        // if commit and dispatch is not from current module
                        if (
                            (isCommit &&
                                !mutationNames.includes(funcName.value)) ||
                            (!isCommit && !actionNames.includes(funcName.value))
                        ) {
                            let [storeName, actionName] =
                                funcName.value.split('/')
                            if (
                                storeValues[storeName]?.functionNames &&
                                actionName
                            ) {
                                storeValues[storeName].functionNames.push(
                                    actionName
                                )
                            } else if (actionName) {
                                storeImports.add(storeName)
                                storeValues[storeName] = {
                                    ...(storeValues[storeName] ?? {}),
                                    functionNames: [actionName],
                                }
                            }
                            if (actionName) {
                                path.value.callee.name = actionName
                            } else {
                                path.value.comments = [
                                    j.commentLine(
                                        'Nuxt3TODO store ',
                                        false,
                                        true
                                    ),
                                ]
                                return
                            }
                            if (path.value.arguments.length) {
                                path.value.comments = [
                                    j.commentLine(
                                        'Nuxt3TODO Please review ',
                                        false,
                                        true
                                    ),
                                ]
                                path.value.arguments =
                                    path.value.arguments.slice(1, 2)
                            }
                            return
                        }
                        j(path).replaceWith((path) => {
                            let newFunctionName = funcName.value
                            if (
                                isCommit &&
                                mutationNames.includes(funcName.value) &&
                                actionNames.includes(funcName.value)
                            ) {
                                newFunctionName = funcName.value + 'Mutation'
                            }
                            if (!newFunctionName) {
                                return j(path).toSource()
                            }
                            if (args) {
                                return j.callExpression(
                                    j.memberExpression(
                                        j.thisExpression(),
                                        j.identifier(newFunctionName)
                                    ),
                                    [args]
                                )
                            } else {
                                return j.callExpression(
                                    j.memberExpression(
                                        j.thisExpression(),
                                        j.identifier(newFunctionName)
                                    ),
                                    []
                                )
                            }
                        })
                    }
                })

            j(property)
                .find(j.MemberExpression, (path) => {
                    if (
                        ['rootGetters', 'rootState'].includes(path.object.name)
                    ) {
                        return true
                    }
                    return false
                })
                .forEach((path) => {
                    let [storeName, getterName] =
                        path.value?.property?.value?.split('/')
                    if (storeValues[storeName]?.getterNames) {
                        storeValues[storeName].getterNames.push(getterName)
                    } else {
                        storeImports.add(storeName)
                        storeValues[storeName] = {
                            ...(storeValues[storeName] ?? {}),
                            getterNames: [getterName],
                        }
                    }
                    j(path).replaceWith(getterName)
                })
            const keys = Object.keys(storeValues)
            let otherVariableDeclaration = []
            if (keys.length) {
                keys.forEach((key) => {
                    let storeName = `use${capitalizeFirstLetter(key)}Store`
                    const storeDeclaration = `${key}Store`
                    // otherVariableDeclarationSyntax += `const ${key}Store = ${storeName}\n`
                    // otherVariableDeclarationSyntax += `const { ${storeValues[key].functionNames.join(',')} } = ${key}Store\n`
                    const varDeclarationStore = j.variableDeclaration('const', [
                        // Create a variable declarator node
                        j.variableDeclarator(
                            // Identifier node for the variable name
                            j.identifier(storeDeclaration),
                            // CallExpression node for the function call
                            j.callExpression(
                                // Identifier node for the function name
                                j.identifier(storeName),
                                // Arguments array, in this case, there are no arguments
                                []
                            )
                        ),
                    ])
                    otherVariableDeclaration.push(varDeclarationStore)
                    try {
                        if (storeValues[key].functionNames) {
                            const varDeclarationStoreFunction =
                                constSpreadVariablesDeclarator(
                                    { j },
                                    {
                                        spreadVariableNames:
                                            storeValues[key].functionNames,
                                        declaredValue: storeDeclaration,
                                    }
                                )
                            otherVariableDeclaration.push(
                                varDeclarationStoreFunction
                            )
                        }
                        if (storeValues[key].getterNames) {
                            const varDeclarationStoreGetter =
                                constSpreadVariablesDeclarator(
                                    { j },
                                    {
                                        spreadVariableNames:
                                            storeValues[key].getterNames,
                                        declaredValue: `storeToRefs(${storeDeclaration})`,
                                    }
                                )
                            otherVariableDeclaration.push(
                                varDeclarationStoreGetter
                            )
                        }
                    } catch (error) {
                        console.log('found error ', error)
                        path.value.comments = [
                            j.commentLine('Nuxt3TODO store', false, true),
                        ]
                    }
                })
            }

            let pluginPropertiesPresent = new Set()
            j(property)
                .find(j.MemberExpression, {
                    object: {
                        type: 'ThisExpression',
                    },
                })
                .forEach((path) => {
                    let propertyName = path?.value?.property?.name
                    if (['$axios', '$toast'].includes(propertyName)) {
                        j(path).replaceWith(propertyName)
                        pluginPropertiesPresent.add(propertyName)
                    }
                })

            pluginPropertiesPresent = Array.from(pluginPropertiesPresent)
            if (pluginPropertiesPresent.length) {
                const nuxtPropertiesVariableDeclaration =
                    constSpreadVariablesDeclarator(
                        { j },
                        {
                            spreadVariableNames: pluginPropertiesPresent,
                            declaredValue: 'useNuxtApp()',
                        }
                    )
                otherVariableDeclaration.unshift(
                    nuxtPropertiesVariableDeclaration
                )
            }

            if (otherVariableDeclaration.length) {
                property.value.body.body.unshift(...otherVariableDeclaration)
            }
        })
    })

    // add imports
    const importDeclaration = []
    Array.from(storeImports).forEach((value) => {
        // const importValue = `import { use${capitalizeFirstLetter(value)}Store } from '~/store/${value}';\n`
        const importDeclarationValue = importDeclarationStatement(
            { j },
            {
                importedValues: [`use${capitalizeFirstLetter(value)}Store`],
                importPath: `~/store/${value}`,
            }
        )
        importDeclaration.push(importDeclarationValue)
    })
    importDeclaration.push(
        importDeclarationStatement(
            { j },
            {
                importedValues: [`defineStore`],
                importPath: `pinia`,
            }
        )
    )
    root.find(j.Program).forEach((programNode) => {
        // Insert the import declaration at the beginning of the body
        programNode.node.body.unshift(...importDeclaration)
    })
}

const constSpreadVariablesDeclarator = (
    { j },
    { spreadVariableNames, declaredValue }
) => {
    return j.variableDeclaration('const', [
        // Create a variable declarator node with an object pattern
        j.variableDeclarator(
            // Object pattern node for destructuring
            j.objectPattern([
                // Property node representing the destructured property
                // ...storeValues[key].functionNames.map(functionName => j.property('init', j.identifier(functionName), j.identifier(functionName)))
                ...(spreadVariableNames?.map((functionName) =>
                    j.property(
                        'init',
                        j.identifier(functionName),
                        j.identifier(functionName)
                    )
                ) ?? []),
            ]),
            // Identifier node for the right-hand side expression
            j.identifier(declaredValue)
        ),
    ])
}

const importDeclarationStatement = (
    { j },
    { importedValues = [], importPath }
) =>
    j.importDeclaration(
        [...importedValues.map((v) => j.importSpecifier(j.identifier(v)))],
        j.literal(importPath)
    )