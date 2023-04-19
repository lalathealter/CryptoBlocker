console.log("Hello world!")


let CPU_LIMIT = 20 // base value (overall percentage limit) 
// don't forget to change it to higher one once you finish with the basic functionality
chrome.system.cpu.getInfo((cpuInfo) => CPU_LIMIT *= cpuInfo.numOfProcessors)

chrome.processes.onUpdated.addListener(function spy(updatedProcs) {
    // console.log(updatedProcs)
    for (const id in updatedProcs) {
        let usage = updatedProcs[id].cpu
        if (usage >= CPU_LIMIT) {
            watchSuspiciousActivity(id, usage)
        }
    }
})

const watchMap = {} 
const watchTime = 5000
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
            sentenceToDeath(procID)
        }
    }
}

function sentenceToDeath(procID) {
    // invoke warning and give the user a choice

    delete watchMap[procID]
    chrome.processes.terminate(Number(procID), function(success) {
        console.log("process was terminated:", success);
    })
}



