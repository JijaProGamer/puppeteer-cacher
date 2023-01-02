let api = require("./index.js")
let cache = new api(false)

let memory = {}

cache.memory = {
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
}

require("puppeteer").launch({
    headless: false
}).then(async (browser) => {
    let page = await browser.newPage()

    await page.setRequestInterception(true);

    page.on('request', (request) => {
        let type = request.resourceType()
        if (type == "document" || type == "script" || type == "font" || type == "stylesheet") {
            cache.get(request, (result, wasFound) => {
                if (!wasFound) return request.continue()

                request.respond(result)
            })
        } else {
            request.continue()
        }
    })

    page.on("requestfinished", async (request) => {
        let type = request.resourceType()
        if (type == "document" || type == "script" || type == "font" || type == "stylesheet") {
            cache.save(request.response())
        }
    })

    await page.goto("https://www.google.com/")
})