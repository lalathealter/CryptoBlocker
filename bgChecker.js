import { getStoredValue, getStoredList, setStoredList  } from "./store.js" 
import { TYPE_ORDER, DECISION_NONE, DECISION_RELEASE, DECISION_TERMINATE } from "./store.js"
import { WHITELIST_NAME, BLACKLIST_NAME, CPULIMIT_NAME, WATCHTIME_NAME} from "./store.js"

chrome.tabs.onUpdated.addListener(lookAfterTabs)
function lookAfterTabs(tabID, changeInfo) {
    let newURL = changeInfo.url
    if (!newURL) {
        return
    }
    
    chrome.processes.getProcessIdForTab(tabID, function lookupCriminalRecord(freshProcID) {

        if (checkWhiteList(newURL)) {
            findInnocent(freshProcID)
            return
        }

        if (checkBlackList(newURL)) {
            // add some user notification 
            decapitate(freshProcID)
            return
        }
    })
}

let whiteList = getStoredList(WHITELIST_NAME) 
const selfLink = chrome.runtime.getURL("/") 
addLinkToWhiteList(selfLink)
function checkWhiteList(url) { 
    return checkInList(url, whiteList)
}

function addLinkToWhiteList(url) {
    addNewLinkToList(url, whiteList, WHITELIST_NAME)
}

let blackList = getStoredList(BLACKLIST_NAME) 
function checkBlackList(url) {
    return checkInList(url, blackList)
}

function addLinkToBlackList(url) {
    addNewLinkToList(url, blackList, BLACKLIST_NAME)
}

function checkInList(url, listRef) {
    if (!listRef || typeof listRef !== "object") {
        console.error("Error: the listRef does not correspond to a valid object")
        return false 
    }
    return getHost(url) in listRef
}

// function shareSameHost(linkA, linkB) {
//     return getHost(linkA) === getHost(linkB)
// }

function getHost(link) {
    const urlObj = new URL(link)
    return urlObj.hostname
}

function addNewLinkToList(url, listRef, listName) {
    if (checkInList(url, listRef)) {
        return
    }
    const hostEntry = getHost(url)
    listRef[hostEntry] = true 
    setStoredList(listName, listRef)
}

let CPU_CORES = 1
let cpuLimit = Number(getStoredValue(CPULIMIT_NAME)) // base value (overall percentage limit) 
let watchTime = Number(getStoredValue(WATCHTIME_NAME)) 
chrome.system.cpu.getInfo((cpuInfo) => {
    CPU_CORES = cpuInfo.numOfProcessors
    cpuLimit *= CPU_CORES
})

window.addEventListener('storage', listenToStorageValues) 

function listenToStorageValues(ev) {
    switch (ev.key) {
        case CPULIMIT_NAME:
            let cpuLimitStored = Number(getStoredValue(ev.key))        
            cpuLimit = CPU_CORES * cpuLimitStored 
            break;
        case WATCHTIME_NAME:
            watchTime = Number(getStoredValue(ev.key)) 
            break;
        case BLACKLIST_NAME:
            blackList = getStoredList(ev.key)
            break
        case WHITELIST_NAME:
            whiteList = getStoredList(ev.key)
            break
        default:
            return     
    }
    console.log(localStorage)
}

chrome.processes.onUpdated.addListener(function spy(updatedProcs) {
    console.log(updatedProcs)
    for (const id in updatedProcs) {
        if (updatedProcs[id].profile === "") {
            continue // internal proccesses
        }
        if (id in innocenceList || id in deathRowMap) {
            continue // allowed by user or already convicted
        }

        let usage = updatedProcs[id].cpu
        if (usage >= cpuLimit) {
            watchSuspiciousActivity(id, usage)
        }
    }
})

chrome.processes.onExited.addListener(function clearMaps(terminatedProcID) {
    clearFromDeathRow(terminatedProcID)
    clearFromInnocenceList(terminatedProcID)
})


const watchMap = {} // ProcID: []cpuUsageRecord
function watchSuspiciousActivity(procID, usage) {
    if (procID in watchMap) {
        watchMap[procID].push(usage)
    } else {
        watchMap[procID] = []
        setTimeout(judgeSuspect(procID), watchTime)
    }
}

function judgeSuspect(procID) {
    return function() {
        if (!(procID in watchMap)) {
            return
        }
        let cpuUsageArray = watchMap[procID]
        let sum = cpuUsageArray.reduce((acc, curr) => acc + Number(curr), 0)
        let average = sum / cpuUsageArray.length   
        if (average >= cpuLimit || average < 0) {
            putOnDeathRow(procID)
        }
    }
}

const deathRowMap = {} // ProcID: boolean
function putOnDeathRow(procID) {
    delete watchMap[procID]
    deathRowMap[procID] = true
    appealForClemency(procID) // invoke warning and give the user a choice
}

function clearFromDeathRow(procID) {
    delete deathRowMap[procID]
}

chrome.runtime.onMessage.addListener(function listenForFinalDecision(request) {
    if (request.type === TYPE_ORDER) {
        const procID = request.process 
        switch (request.decision) {
            case DECISION_TERMINATE:
                decapitate(procID)
                break;
            case DECISION_RELEASE:
                findInnocent(procID)
                break
            case DECISION_NONE:
                break;
            default:
                break
        }
        clearFromDeathRow(procID)
    }
})

const innocenceList = {} // ProcID: boolean
function findInnocent(procID) {
    innocenceList[procID] = true
    saveURLWith(addLinkToWhiteList)(procID)
}

function clearFromInnocenceList(procID) {
    delete innocenceList[procID]
}


function decapitate(procID) {
    console.log("process to terminate:", procID)
    if (procID in deathRowMap) {
        chrome.processes.terminate(Number(procID), function(success) {
            console.log("process was terminated:", success);
            saveURLWith(addLinkToBlackList)(procID)
        })
    }
}


function saveURLWith(saveMethod) {
    return function(procID) {
        chrome.processes.getProcessInfo(Number(procID), false, function(processesDict) {
            for (const k in processesDict) {
                let process = processesDict[k] 
                let firstTask = process.tasks.find(task => "tabId" in task)
                if (!firstTask) {
                    return
                }
                chrome.tabs.get(firstTask.tabId, function(tabObj) {
                    let targetURL = tabObj.url
                    saveMethod(targetURL)
                }) 
            }    
        })
    }
}


function appealForClemency(procID) {
    chrome.processes.getProcessInfo(Number(procID), false, function(processesDict) {
        for (const k in processesDict) {
            let tasks = processesDict[k].tasks 
            let tasksText = tasks 
                .map(task => task.title)
                .join("; ")

            window.open(
                chrome.extension.getURL(
                    `dialog.html?process=${procID}&tasks=${tasksText}`
                ),
                'warning!', 
                `width=400, height=400
                toolbar=no, location=no, directories=no, 
                status=no, menubar=no, scrollbars=no, 
                resizable=no, copyhistory=no`
            )        
        }
    })
    
}
