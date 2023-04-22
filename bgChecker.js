import { getStoredValue } from "./store.js" 

let CPU_CORES = 1
let cpuLimit // base value (overall percentage limit) 
let watchTime 
chrome.system.cpu.getInfo((cpuInfo) => {
    CPU_CORES = cpuInfo.numOfProcessors
    listenToStorageValues()
})

window.addEventListener('storage', listenToStorageValues) 

function listenToStorageValues() {
    let cpuLimitStored = Number(
        getStoredValue("cpulimit")
    )
    cpuLimit = CPU_CORES * cpuLimitStored 
    watchTime = Number(
        getStoredValue("watchtime")
    )
    console.log(cpuLimit, watchTime)
}

let lastUpdatedProcs // last updated processes
chrome.processes.onUpdated.addListener(function spy(updatedProcs) {
    console.log(updatedProcs)
    lastUpdatedProcs = updatedProcs
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

chrome.runtime.onMessage.addListener(function listenTheFinalWord(request) {
    if (request.type === "order-release") {
        release(request.process)
    } 
    if (request.type === "order-terminate") {
        execute(request.process)
    }
})

const innocenceList = {} // ProcID: boolean
function release(procID) {
    innocenceList[procID] = true
    delete deathRowMap[procID]
}

function execute(procID) {
    console.log("process to terminate:", procID)
    if (procID in deathRowMap) {
        chrome.processes.terminate(Number(procID), function(success) {
            console.log("process was terminated:", success);
        }) 
        delete deathRowMap[procID]
    }
}


function appealForClemency(procID) {
    let tasks = lastUpdatedProcs[procID].tasks
    let taskText = tasks 
        .map(task => task.title)
        .join("; ")

    window.open(
        chrome.extension.getURL(
            `dialog.html?process=${procID}&tasks=${taskText}`
        ),
        'warning!', 
        `width=400, height=400
        toolbar=no, location=no, directories=no, 
        status=no, menubar=no, scrollbars=no, 
        resizable=no, copyhistory=no`
    )
}
