console.log("Hello world!")


// window.
const timeInterval = 5000

const marges = Array.from(
    {length: navigator.hardwareConcurrency}, 
    el => [0, 0]
    )
chrome.system.cpu.getInfo(
    (info) => {
        let i = 0
        for (let p of info.processors) {
            const {idle, kernel, total, user} = p.usage
            console.log(idle, kernel, total, user)
            let currWork = kernel + user
            marges[i][0] = currWork - marges[i][0] 
            marges[i][1] = total - marges[i][1] 
            i++
        }
    }
)
for (let c of marges) {

}
console.log(marges)
setInterval(() => {
    chrome.system.cpu.getInfo(
        (info) => {
            console.log(info)
            let perc = 0
            for (let i = 0; i < marges.length; i++) {
                const proc = info.processors[i]
                const {kernel, total, user} = proc.usage
                console.log(kernel, total, user)
                let currWork = kernel + user
                const [prevWork, prevTotal] = marges[i]
                perc += (currWork - prevWork) / (total - prevTotal)
                marges[i] = [currWork, total]
                console.log(marges[i])
 
            }
            perc /= marges.length
            console.log(perc)
            
        }
    )
    
    
}, timeInterval)