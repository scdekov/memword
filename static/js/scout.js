export class Scout {
    static imagesCache = {}
    static meaningsCache = {}

    static getMeaning = q => {
        if (q in Scout.meaningsCache) {
            return Promise.resolve(Scout.meaningsCache[q])
        }
        return fetch(`api/meanings?q=${encodeURIComponent(q)}`)
            .then(resp => resp.json())
            .then(json => {
                Scout.meaningsCache[q] = json.meanings[0].description
                return Scout.meaningsCache[q]
            })
    }

    static getImages = q => {
        if (q in Scout.imagesCache) {
            return Promise.resolve(Scout.imagesCache[q])
        }

        return fetch(`api/images?q=${encodeURIComponent(q)}`)
            .then(resp => resp.json())
            .then(json => {
                Scout.imagesCache[q] = json.images.map(image => image.link)
                return Scout.imagesCache[q]
            })
    }
}
