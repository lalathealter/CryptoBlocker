
import { optionsPresetMap, setStoredValue, getStoredValue } from "./store.js"

for (const key in optionsPresetMap) {
    defineBehaviour(key)
}

function defineBehaviour(keyName) {
    const elem = document.getElementById(keyName)
    elem.value = getStoredValue(keyName)
    elem.onchange = bindSetStoredValue(keyName)
}

function bindSetStoredValue(valName) {
    return function(ev) {
        let newVal = ev.target.value
        setStoredValue(valName, newVal)
    }
}

