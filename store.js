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

export function setStoredValue(valName) {
    return function(ev) {
        let newVal = ev.target.value
        localStorage.setItem(valName, newVal)
    }
}

export function setStoredList(listName, nextList) {
    if (typeof nextList !== "object" || !nextList) {
        console.error("were trying to save an invalid list")
        return
    } 
    localStorage.setItem(listName, JSON.stringify(nextList))
}

export function getStoredList(listName) {
    return JSON.parse(localStorage.getItem(listName)) ?? {}
}

