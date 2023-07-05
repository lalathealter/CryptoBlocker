export const TYPE_ORDER = "order"
export const DECISION_TERMINATE = "terminate"
export const DECISION_RELEASE = "release"
export const DECISION_NONE = ""

export const WHITELIST_NAME = "whitelist"
export const BLACKLIST_NAME = "blacklist"
export const WATCHTIME_NAME = "watchtime"
export const CPULIMIT_NAME = "cpulimit"

export const optionsPresetMap = {
    [WATCHTIME_NAME]: 10000, 
    [CPULIMIT_NAME]: 80,
} 


export function getStoredValue(valName) {
    let defaultVal = optionsPresetMap[valName]
    let val = localStorage.getItem(valName)  
    if (!val) {
        localStorage.setItem(valName, defaultVal)
        val = defaultVal
    }
    return val 
}

export function bindSetStoredValue(valName) {
    return function(newVal) {
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

// Drupal Cryptojacking Campaigns -- Affected Sites
// https://docs.google.com/spreadsheets/d/14TWw0lf2x6y8ji5Zd7zv9sIIVixU33irCM-i9CIrmo4/
export const blacklistsOnGoogleDocSheets = [
    // { 
    //     sheetID: "14TWw0lf2x6y8ji5Zd7zv9sIIVixU33irCM-i9CIrmo4",
    //     tabNames: [
    //         "drupal.js Campaign",
    //         "Crypto-Loot Campaign",
    //         "vuuwd.com Campaign - Round 1",
    //         "vuuwd.com Campaign - Round 2"
    //     ]
    // }
]

export const populateList = populateListFrom(blacklistsOnGoogleDocSheets)

function populateListFrom(googleSheets) {
    // this service is used for easier google sheet's reading,
    // - it helps us to abstract from manually downloading 
    // the sheets in .csv files and parsing those to json format;
    // by using it we also spare user's machine resources and
    // avoid unnecessary interaction with system files;
    // https://github.com/benborgers/opensheet
    // example link: https://opensheet.elk.sh/spreadsheet_id/tab_name

    const service = "https://opensheet.elk.sh"
    const linkToService = new URL(service)
    return function(listRef, listName) {
        console.log(`starting to populate the ${listName} from public sources;`)
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
                console.log(`finished populating the ${listName} from public sources;`)
            }
        }, 10000)
    }
}


