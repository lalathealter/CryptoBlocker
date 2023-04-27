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


export const blacklistsOnGoogleDocSheets = [
    { 
        sheetID: "14TWw0lf2x6y8ji5Zd7zv9sIIVixU33irCM-i9CIrmo4",
        tabNames: [
            "drupal.js Campaign",
            "Crypto-Loot Campaign",
            "vuuwd.com Campaign - Round 1",
            "vuuwd.com Campaign - Round 2"
        ]
    }
]

export const populateList = populateListFrom(blacklistsOnGoogleDocSheets)

function populateListFrom(googleSheets) {
    // https://github.com/benborgers/opensheet
    //example: https://opensheet.elk.sh/spreadsheet_id/tab_name

    const service = "https://opensheet.elk.sh"
    const linkToService = new URL(service)
    return function(listRef, listName) {
        let tabsNeeded = 0
        for (const sheetObj of googleSheets) {
            const linkToSheet = new URL(sheetObj.sheetID, linkToService)
            tabsNeeded += sheetObj.tabNames.length
            for (const tab of sheetObj.tabNames) {
                const fullLink = linkToSheet.href + `/${tab}`

                fetch(fullLink)
                    .then(res => res.json())
                    .then(jsonRows => {
                        for (const row of jsonRows) {
                            const hostReg = row.Domain
                            listRef[hostReg] = true
                        }
                        tabsNeeded--
                    })
            }
        }

        const waiter = setInterval(() => {
            if (tabsNeeded <= 0) {
                setStoredList(listName, listRef)
                clearInterval(waiter)
            }
        }, 10000)
    }
}


