import {fetchJSON} from 'utils'

export class Scout {
    static googleCache = {}
    static meaningsCache = {}

    static getMeaning = q => {
        if (q in Scout.meaningsCache) {
            return Scout.meaningsCache[q]
        }
        return (Scout.meaningsCache[q] = fetchJSON(`api/meanings?q=${encodeURIComponent(q)}`)
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

        return (Scout.googleCache[q] = fetchJSON(`api/images?q=${encodeURIComponent(q)}`))
    }
}
