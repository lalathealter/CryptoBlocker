
import { CPULIMIT_NAME, optionsPresetMap, bindSetStoredValue, getStoredValue } from "./store.js"

const elemsThatNeedIndicators = [
    CPULIMIT_NAME,
]

for (const key in optionsPresetMap) {
    defineBehaviour(key)
}

function defineBehaviour(keyName) {
    const elem = getSurelyImplemented(keyName)
    elem.value = getStoredValue(keyName)
    elem.onchange = bindEventMethods(keyName)

    elem.dispatchEvent(new Event('change')) 
    // triggering an event to refresh any available indicators
}


function bindEventMethods(valName) {
    let indicateMethod = function() {}
    if (elemsThatNeedIndicators.includes(valName)) {
        indicateMethod = refreshIndicator 
    } 
    let saveMethod = bindSetStoredValue(valName) 
    return function(ev) {
        let newVal = ev.target.value
        indicateMethod(valName, newVal)
        saveMethod(newVal)
    }
}

function getSurelyImplemented(elemID) {
    const htmlElement = document.getElementById(elemID)
    if (!htmlElement) {
        alert(`Error! No implementation for an html element of the ${elemID} found`)
    }
    return htmlElement
}

function refreshIndicator(indicatorValName, newVal) {
    const indicator = getSurelyImplemented(`${indicatorValName}-indicator`)
    indicator.innerText = `${newVal}%`
}
