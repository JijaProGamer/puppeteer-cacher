let cache = require("./index.js")
cache.setFullSave(false)

let memory = {}

cache.changeStore({
    get: (name) => {
        return new Promise((resolve, reject) => {
            resolve(memory[name])
        })
    },
    set: (name, value) => {
        return new Promise((resolve, reject) => {
            memory[name] = value
            resolve()
        })
    }
})

require("puppeteer").launch({
    headless: false
}).then(async (browser) => {
    let page = await browser.newPage()

    await page.setRequestInterception(true);
    page.on('request', async (request) => {
        let type = await request.resourceType()
        if(type == "document" || type == "script" || type == "font" || type == "stylesheet"){
            cache.get(request).then((result) => {            
                if(result){ 
                    request.respond(result)
                } else {
                    request.continue()
                }
            })
        } else {
            request.continue()
        }
    })

    page.on("requestfinished", async (request) => {
        await cache.save(await request.response())
    })

    await page.goto("https://www.google.com/")
})