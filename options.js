
import { optionsPresetMap, setStoredValue, getStoredValue } from "./store.js"

const elemsThatNeedIndicators = [
    "cpulimit",
]

for (const key in optionsPresetMap) {
    defineBehaviour(key)
}

function defineBehaviour(keyName) {
    const elem = getSurelyImplemented(keyName)
    elem.value = getStoredValue(keyName)
    elem.onchange = bindSetStoredValue(keyName)

    elem.dispatchEvent(new Event('change')) 
    // triggering an event to refresh any available indicators
}


function bindSetStoredValue(valName) {
    let indicateMethod = function() {}
    if (elemsThatNeedIndicators.includes(valName)) {
        indicateMethod = refreshIndicator 
    } 
    return function(ev) {
        let newVal = ev.target.value
        indicateMethod(valName, newVal)
        setStoredValue(valName, newVal)
    }
}

function getSurelyImplemented(elemID) {
    const htmlElement = document.getElementById(elemID)
    if (!htmlElement) {
        alert(`Error! You forgot to implement an html element for the value of ${elemID}`)
    }
    return htmlElement
}

function refreshIndicator(indicatorValName, newVal) {
    const indicator = getSurelyImplemented(`${indicatorValName}-indicator`)
    indicator.innerText = `${newVal}%`
}
