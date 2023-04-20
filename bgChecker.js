

let CPU_LIMIT = 3 // base value (overall percentage limit) 
// don't forget to change it to higher one once you finish with the basic functionality
chrome.system.cpu.getInfo((cpuInfo) => CPU_LIMIT *= cpuInfo.numOfProcessors)

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
        if (usage >= CPU_LIMIT) {
            watchSuspiciousActivity(id, usage)
        }
    }
})

const watchMap = {} // ProcID: []cpuUsageRecord
const watchTime = 5000 // don't forget to change it to higher one
function watchSuspiciousActivity(procID, usage) {
    if (procID in watchMap) {
        watchMap[procID].push(usage)
    } else {
        watchMap[procID] = []
        setTimeout(judgeSuspect(procID), watchTime)
    }
}

function judgeSuspect(procID) {
    let cpuUsageArray = watchMap[procID]
    return function() {
        let sum = cpuUsageArray.reduce((acc, curr) => acc += curr, 0)
        let average = sum / cpuUsageArray.length   
        if (average >= CPU_LIMIT) {
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
        'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no'
    )
}
