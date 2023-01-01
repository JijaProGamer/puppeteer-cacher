let memory = {}
let fullSave = false

let memoryStore = {
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

module.exports = {
    changeStore: (newStore) => {
        memoryStore = newStore
    },
    setFullSave: (newFullSave) => {
        fullSave = newFullSave
    },
    get: function (request) {
        return new Promise(async (resolve, reject) => {
            let chain = request.redirectChain()
            let url = await request.url()

            if (!fullSave) {
                url = url.split("?")[0]
            }

            if (chain > 0) {
                resolve()
            } else {
                memoryStore.get(url)
                    .then(resolve)
                    .catch(reject)
            }
        })
    },
    save: (result) => {
        return new Promise(async (resolve, reject) => {
            result.buffer().then(async (body) => {
                let headers = await result.headers()
                let status = await result.status()
                let url = await result.url()

                if (!fullSave) {
                    url = url.split("?")[0]
                }

                memoryStore.set(url, {
                    status: status,
                    body: body,
                    //headers: headers,
                    content: headers["content-type"] && headers["content-type"].split(";")[0] || "text/plain",
                })

                resolve()
            }).catch(() => { })
        })
    },
}