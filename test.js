let cacher = require("./index.js")
let CACHE = new cacher()

require("puppeteer").launch({
    headless: false
}).then(async (browser) => {
    let page = await browser.newPage()

    await page.setRequestInterception(true);
    page.on('request', async (request) => {
        let type = await request.resourceType()
        if(type == "document" || type == "script" || type == "font" || type == "stylesheet"){
            CACHE.get(request).then((result) => {            
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
        await CACHE.save(await request.response())
    })

    await page.goto("https://www.google.com/")
})