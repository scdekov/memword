import { fetchJSON, cacheRequest } from 'utils'

export class Scout {
    static cachedFetchJSON = cacheRequest(fetchJSON, { prolongCachedResponse: 1000 })

    static getMeaning = q => {
        return Scout.cachedFetchJSON(`api/meanings?q=${encodeURIComponent(q)}`)
            .then(json => json.meanings[0].description, console.log)
    }

    static getImages = q => {
        return Scout.cachedFetchJSON(`api/images?q=${encodeURIComponent(q)}`)
            .then(json => json.images.map(img => img.link))
    }

    static getCorrectQuery = q => {
        return Scout.cachedFetchJSON(`api/images?q=${encodeURIComponent(q)}`)
            .then(json => json.query_correction)
    }
}
