export const optionsPresetMap = {
    watchtime: 2500, 
    cpulimit: 10,
} 
// don't forget to change those to higher ones once you finish with the basic functionality


export function getStoredValue(valName) {
    let defaultVal = optionsPresetMap[valName]
    let val = localStorage.getItem(valName)  
    if (!val) {
        localStorage.setItem(valName, defaultVal)
        val = defaultVal
    }
    return val 
}

export function setStoredValue(valName, newVal) {
    localStorage.setItem(valName, newVal)
}

