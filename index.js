let tMP = {}

class cacher{
    memory = {
        get: (name) => {
            return new Promise((resolve, reject) => {
                resolve(tMP[name])
            })
        },
        set: (name, value) => {
            return new Promise((resolve, reject) => {
                tMP[name] = value
                resolve()
            })
        }
    }

    fullURL = false

    constructor (doFullURL){
        this.fullURL = this.fullURL
    }

    changeMemory(newMemory){
        this.memory = newMemory
    }

    async get(request, respond){
        let url = request.url();
        if(!this.fullURL) url = url.split("?")[0]
        
        const current = await this.memory.get(url)
        if (current && current.expires > Date.now()) {
           return  respond(current, true)
        }

        respond(undefined, false)
    }

    async save(response){
        let url = response.url()
        const headers = response.headers()
        const cacheControl = headers['cache-control'] || ''
        const maxAgeMatch = cacheControl.match(/max-age=(\d+)/)
        const maxAge = 86400 // maxAgeMatch && maxAgeMatch.length > 1 ? parseInt(maxAgeMatch[1], 10)

        if(!this.fullURL) url = url.split("?")[0]

        if (maxAge) {
            let current = this.memory.get(url)

            if(current && current.expires > Date.now()) return
            
            let buffer;
            try {
                buffer = await response.buffer();
            } catch (error) {
                return;
            }

            this.memory.set(url, {
                status: response.status(),
                //headers: response.headers(),
                body: buffer,
                expires: Date.now() + (maxAge * 1000),
            })
        }
    }
}

module.exports = cacher