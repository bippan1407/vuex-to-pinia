import { transformState } from './state.js'
import { transformGetter } from './getter.js'
import { transformAction } from './action.js'
import { replaceProperty } from './replaceProperty.js'
import { transformThisExpression } from './thisExpression.js'
import { transformCommitDispatch } from './commitAndDispatch.js'
export default {
    transformState,
    transformGetter,
    transformAction,
    replaceProperty,
    transformThisExpression,
    transformCommitDispatch,
}
