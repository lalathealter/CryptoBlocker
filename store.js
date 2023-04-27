export const TYPE_ORDER = "order"
export const DECISION_TERMINATE = "terminate"
export const DECISION_RELEASE = "release"
export const DECISION_NONE = ""

export const WHITELIST_NAME = "whitelist"
export const BLACKLIST_NAME = "blacklist"
export const WATCHTIME_NAME = "watchtime"
export const CPULIMIT_NAME = "cpulimit"

export const optionsPresetMap = {
    [WATCHTIME_NAME]: 2500, 
    [CPULIMIT_NAME]: 10,
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

