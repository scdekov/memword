import {fetchJSON} from 'utils'

export class Scout {
    static imageDepotCache = {}
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
        return Scout._imageSearch(q)
            .then(json => json.images)
    }

    static getCorrectQuery = q => {
        return Scout._imageSearch(q)
            .then(json => json.query_correction)
    }

    static _imageSearch = q => {
        if (q in Scout.imageDepotCache) {
            return Scout.imageDepotCache[q]
        }

        return (Scout.imageDepotCache[q] = fetchJSON(`api/images?q=${encodeURIComponent(q)}`))
    }
}
