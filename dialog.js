import { DECISION_NONE, DECISION_TERMINATE, DECISION_RELEASE, TYPE_ORDER } from "./store.js"

window.onbeforeunload = sendOrder(DECISION_NONE)

const denyButton = document.getElementById("btndeny")
denyButton.onclick = sendOrder(DECISION_TERMINATE)
const allowButton = document.getElementById("btnallow")
allowButton.onclick = sendOrder(DECISION_RELEASE)

const params = new URLSearchParams(document.location.search)
const tasks = params.get("tasks")
const process = params.get("process")

let suspectSpan = document.getElementById("suspect")
suspectSpan.textContent = `${tasks}` 

function sendOrder(decision) {
    return function() {
        chrome.runtime.sendMessage({
            type: TYPE_ORDER,
            decision: decision,
            process: process
        })
        window.close()
    }
}
