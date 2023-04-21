
import { optionsPresetArr, setStoredValue, getStoredValue } from "./store.js"

for (const element of optionsPresetArr) {
    defineBehaviour(element)
}

function defineBehaviour(elementPreset) {
    const [officialName, defaultVal] = elementPreset
    const elem = document.getElementById(officialName)
    elem.value = getStoredValue(officialName, defaultVal)
    elem.onchange = setStoredValue(officialName)
}


