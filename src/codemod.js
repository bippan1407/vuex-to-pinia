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

class Codemod {
    filePath = ''
    fileInfo
    transformationObject = {
        j: null,
        root: null,
    }
    vuexProperties = {
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
        let storeName = basename(this.filePath).split('.')[0]
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
        return this.getSource()
    }

    getPiniaTemplate(storeName, stateSyntax, actionSyntax, getterSyntax) {
        return `export const use${capitalizeFirstLetter(storeName)} = defineStore('${storeName}',{
    state: ${stateSyntax !== '' ? stateSyntax : ''},
    actions: ${actionSyntax !== '' ? actionSyntax : ''},
    getters: ${getterSyntax !== '' ? getterSyntax : ''}
  })`
    }
}

export default Codemod
