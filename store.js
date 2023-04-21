export const optionsPresetArr = [ 
    [ "watchtime", 2500 ], 
    [ "cpulimit", 10 ]
// don't forget to change those to higher ones once you finish with the basic functionality
]

export function getStoredValue(valName, defaultVal) {
    let properName = (valName)
    let val = localStorage.getItem(properName)  
    if (!val) {
        localStorage.setItem(properName, defaultVal)
        val = defaultVal
    }
    return val 
}

export function setStoredValue(valName) {
    return function(ev) {
        let newVal = ev.target.value
        let properName =  (valName)
        localStorage.setItem(properName, newVal)
    }
}

