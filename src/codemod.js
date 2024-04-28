import vueCodemod from 'vue-codemod'
import { readFileSync, writeFileSync, statSync } from 'fs'
import {
    capitalizeFirstLetter,
    getFileName,
    readJson,
    writeToJsonFile,
} from './utility/index.js'
import vuexProperties from './vuexProperties/index.js'
import configOptionsService from './configOptionsService.js'
import { basename, join } from 'path'
import { analyseAndUpdate } from './vuexProperties/analyse.js'
import transform from './transform/index.js'
import babel from '@babel/core'
import chalk from 'chalk'
import pluginTransformArrowFunction from '@babel/plugin-transform-arrow-functions'
class Codemod {
    filePath = ''
    fileInfo
    transformationObject = {
        j: null,
        root: null,
    }
    vuexProperties = {
        filename: '',
        vuexStoreName: '',
        storeName: '',
        stateNames: [],
        mutationNames: [],
        actionNames: [],
        getterNames: [],
    }

    initialiseFile = (
        _filePath,
        options = {
            shouldTransformMainFile: false,
            transformedFolderLocation: null,
        }
    ) => {
        this.filePath = _filePath
        this.fileInfo = {
            path: this.filePath,
            source: readFileSync(this.filePath).toString(),
        }
        let fileSource = vueCodemod.runTransformation(
            this.fileInfo,
            (fileInfo, api) => {
                this.transformationObject.j = api.jscodeshift
                this.transformationObject.root = api.jscodeshift(
                    fileInfo.source
                )
                this.initialiseVuexProperties()
                if (
                    options.transformedFolderLocation ||
                    options.shouldTransformMainFile
                ) {
                    return this.transform()
                }
            }
        )
        let transformFileLocation
        if (
            !options.shouldTransformMainFile &&
            options.transformedFolderLocation
        ) {
            transformFileLocation = `${
                options.transformedFolderLocation
            }/${getFileName(this.filePath)}`
        } else if (options.shouldTransformMainFile) {
            transformFileLocation = this.filePath
        }
        if (transformFileLocation) {
            writeFileSync(`${transformFileLocation}`, fileSource)
        }
    }

    getCurrentTransformFileName = () => {
        return this.filePath
    }

    getSource() {
        return this.transformationObject.root.toSource()
    }

    initialiseVuexProperties() {
        const filename = basename(this.filePath)
        this.vuexProperties.filename = filename
        let storeName = filename.split('.')[0]
        this.vuexProperties.vuexStoreName = storeName
        storeName = `${storeName}Store`
        this.vuexProperties.storeName = storeName
        this.vuexProperties.stateNames = vuexProperties.getStateNames(
            this.transformationObject
        )
        this.vuexProperties = {
            ...this.vuexProperties,
            ...vuexProperties.getMutationActionGetterNames(
                this.transformationObject
            ),
        }
        analyseAndUpdate(this.vuexProperties)
        this.saveVuexPropertiesToFile()
    }

    saveVuexPropertiesToFile() {
        const configOptions = configOptionsService().get()
        let fileLocation
        if (
            statSync(configOptions.saveVuexPropertiesFileLocation).isDirectory
        ) {
            const defaultFileName = 'vuex-properties.json'
            fileLocation = join(
                configOptions.saveVuexPropertiesFileLocation,
                defaultFileName
            )
        } else {
            fileLocation = configOptions.saveVuexPropertiesFileLocation
        }
        const readFile = readJson(fileLocation)

        readFile[this.filePath] = this.vuexProperties
        writeToJsonFile(fileLocation, readFile)
    }

    transform() {
        transform.transformThisExpression(this.transformationObject, {
            vuexProperties: this.vuexProperties,
        })
        transform.transformCommitDispatch(this.transformationObject, {
            vuexProperties: this.vuexProperties,
        })
        const stateSyntax = transform.transformState(
            this.transformationObject,
            { vuexProperties: this.vuexProperties }
        )
        const actionSyntax = transform.transformAction(
            this.transformationObject,
            { vuexProperties: this.vuexProperties }
        )
        const getterSyntax = transform.transformGetter(
            this.transformationObject,
            { vuexProperties: this.vuexProperties }
        )
        transform.replaceProperty(
            this.transformationObject,
            this.getPiniaTemplate(
                this.vuexProperties.storeName,
                stateSyntax,
                actionSyntax,
                getterSyntax
            )
        )
        let newSyntax = this.getSource()
        return this.runBabelTransformation(newSyntax)
    }

    getPiniaTemplate(storeName, stateSyntax, actionSyntax, getterSyntax) {
        return `export const use${capitalizeFirstLetter(storeName)} = defineStore('${storeName}',{
    state: ${stateSyntax !== '' ? stateSyntax : '{}'},
    actions: ${actionSyntax !== '' ? actionSyntax : '{}'},
    getters: ${getterSyntax !== '' ? getterSyntax : '{}'}
  })`
    }

    runBabelTransformation(syntax) {
        try {
            syntax = babel.transformSync(syntax, {
                plugins: [pluginTransformArrowFunction],
            })
            let code = syntax.code
            // fix to remove _this that is being added by babel while transforming
            code = code.replace('var _this = this;\n', '')
            code = code.replace(/(_this)/g, 'this')
            return code
        } catch (error) {
            if (configOptionsService().get().saveErrorLogs) {
                console.log(' ---- START Error in babel transformation -----')
                console.log(error)
                console.log(' ---- END Error in babel transformation -----')
            }
            console.log(
                chalk.red(
                    `Babel transformation could not be run on file ${this.fileInfo.path} `
                )
            )
            return syntax
        }
    }
}

export default Codemod
