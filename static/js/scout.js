export class Scout {
    static googleCache = {}
    static meaningsCache = {}

    static getMeaning = q => {
        if (q in Scout.meaningsCache) {
            return Scout.meaningsCache[q]
        }
        return (Scout.meaningsCache[q] = fetch(`api/meanings?q=${encodeURIComponent(q)}`)
            .then(resp => resp.json())
            .then(json => {
                return json.meanings[0].description
            }))
    }

    static getImages = q => {
        return Scout._googleSearch(q)
            .then(json => json.images.map(img => img.link))
    }

    static getCorrectQuery = q => {
        return Scout._googleSearch(q)
            .then(json => json.query_correction)
    }

    static _googleSearch = q => {
        if (q in Scout.googleCache) {
            return Scout.googleCache[q]
        }

        return (Scout.googleCache[q] = fetch(`api/images?q=${encodeURIComponent(q)}`)
            .then(resp => resp.json()))
    }
}
