import { basename, join } from 'path'
import {
    readFileSync,
    readdirSync,
    statSync,
    unlinkSync,
    existsSync,
    writeFileSync,
} from 'fs'

const addUniqueValuesToArray = (arr, key, value) => {
    if (arr[key]) {
        arr[key].push(value)
    } else {
        arr[key] = [value]
    }
    return arr
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

function getFileName(filePath) {
    var filename = basename(filePath)
    return filename
}

function deleteFilesInFolderSync(folderPath) {
    try {
        const files = readdirSync(folderPath)

        files.forEach((file) => {
            const filePath = join(folderPath, file)
            const stats = statSync(filePath)

            if (stats.isFile()) {
                unlinkSync(filePath)
                console.log(`Deleted file: ${filePath}`)
            }
        })
    } catch (err) {
        console.error('Error:', err)
    }
}

const lifecycleHooks = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeUnmount',
    'unmounted',
    'errorCaptured',
    'activated',
    'deactivated',
    'destroyed',
    'beforeDestroy',
]

const notRequiredProperties = ['name', 'components']

const allVueProperties = [
    'mounted',
    'computed',
    'watch',
    'emits',
    'head',
    'fetch',
    'asyncData',
    'head',
    'layout',
    'mixins',
    ...lifecycleHooks,
    ...notRequiredProperties,
]

function readFilesRecursively(
    folderPath,
    options = { skipDir: [] },
    fileCallback
) {
    const files = readdirSync(folderPath)

    files.forEach((fileName) => {
        const filePath = join(folderPath, fileName)
        const fileStat = statSync(filePath)
        const folderName = basename(folderPath)
        if (
            fileStat.isDirectory() &&
            !options.skipDir.includes(folderName) &&
            folderName.charAt(0) !== '.'
        ) {
            readFilesRecursively(filePath, options, fileCallback)
        } else if (fileStat.isFile()) {
            fileCallback(filePath)
        }
    })
}

function getFileExtension(filename) {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

const nuxtPropertiesToConvert = [
    {
        name: '$router',
        newName: 'router',
    },
    {
        name: '$route',
        newName: 'route',
    },
    {
        name: '$device',
        newName: 'device',
    },
]

const homeDirectory = join(
    process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH
)

const addCodeInRegion = (regionName, code) => {
    if (!code) {
        return ''
    }
    return `\n// #region ${regionName}
${code}
// #endregion ${regionName}\n`
}

const readJson = (path) => {
    let json = {}
    try {
        if (existsSync(path)) {
            json = JSON.parse(readFileSync(path).toString())
        }
    } catch (error) {
        console.log('error in readJson ')
    }
    return json
}

const writeToJsonFile = (path, writeData) => {
    // if (existsSync(path)) {
    writeFileSync(path, JSON.stringify(writeData))
    // } else {
    //     writeFileSync(path, JSON.stringify(writeData))
    // }
}

export {
    readJson,
    getFileName,
    writeToJsonFile,
    homeDirectory,
    lifecycleHooks,
    addCodeInRegion,
    getFileExtension,
    allVueProperties,
    readFilesRecursively,
    notRequiredProperties,
    capitalizeFirstLetter,
    addUniqueValuesToArray,
    deleteFilesInFolderSync,
    nuxtPropertiesToConvert,
}
