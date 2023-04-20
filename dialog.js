const denyButton = document.getElementById("btndeny")
denyButton.onclick = sendOrder('order-terminate')
const allowButton = document.getElementById("btnallow")
allowButton.onclick = sendOrder('order-release')

const params = new URLSearchParams(document.location.search)
const tasks = params.get("tasks")
const process = params.get("process")

let suspectSpan = document.getElementById("suspect")
suspectSpan.textContent = `${tasks}` 

function sendOrder(order) {
    return function() {
        chrome.runtime.sendMessage({
            type: order,
            process: process
        })
        window.close()
    }
}
