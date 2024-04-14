let configInitialised = false
let configOptions = {
    isDev: false,
    projectLocation: null,
    transformedFolderLocation: null,
    dryRun: true,
    emptyTransformFolder: false,
    saveErrorLogs: false,
    saveErrorLogsFilePath: '',
    saveVuexPropertiesFileLocation: '',
}

function configOptionsService() {
    return {
        get() {
            return configOptions
        },
        initialise(options) {
            if (configInitialised) {
                return
            }
            configInitialised = true
            configOptions = {
                ...configOptions,
                ...options,
            }
        },
    }
}

export default configOptionsService
