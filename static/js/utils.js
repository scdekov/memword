import Cookie from 'js-cookie'

export function isEmpty (something) {
    return Object.keys(something).length === 0
}

export function handleAPIResponse (resp) {
    const contentType = resp.headers.get('content-type')
    var isJSON = contentType && contentType.indexOf('application/json') !== -1

    var nextResponse = isJSON ? resp.json() : resp.text()

    return resp.ok ? nextResponse : nextResponse.then(data => Promise.reject(data))
}

export function fetchJSON (url, params = {}) {
    let resultParams = copyObj(params)
    resultParams['headers'] = Object.assign({
        'X-CSRFToken': Cookie.get('csrftoken'),
        'Content-Type': 'application/json'
    }, resultParams['headers'] || {})

    if (url === '/api/questions/@current') {
        return new Promise((resolve) => {
            setTimeout(() => resolve(
                [1, 2, 3].map((id) =>
                    ({
                        id: id,
                        target_id: `correct-target-${id}`,
                        answers: [
                            { target_id: `correct-target-${id}`, identifier: `one-${id}`, description: 'Some random stuff', imgUrl: '' },
                            { target_id: 'not-correct-target-3', identifier: `one-${id}`, description: 'Not correct 3', imgUrl: '' },
                            { target_id: 'not-correct-target-2', identifier: `one-${id}`, description: 'Not correct 2', imgUrl: '' },
                            { target_id: 'not-correct-target-1', identifier: `one-${id}`, description: 'Not correct 1', imgUrl: '' }
                        ]
                    })
                )))
        })
    }

    return fetch(url, resultParams)
        .then(handleAPIResponse)
}

function copyObj (obj) {
    return JSON.parse(JSON.stringify(obj))
}

export function debounce (func, ms) {
    let lastTimeout = null

    return (...args) => {
        clearTimeout(lastTimeout)
        lastTimeout = setTimeout(() => func(...args), ms)
    }
}

export function cacheRequest (func, options = { cacheValidityTimeout: 1000 * 60 * 60, prolongCachedResponse: 0 }) {
    return (...args) => {
        if (!func.name) { throw new Error('Cannot cache unnamed functions') }

        let key = `${func.name} ${JSON.stringify(args)}`
        let cached = window.localStorage.getItem(key)

        if (cached) {
            return new Promise((resolve) =>
                setTimeout(() => resolve(JSON.parse(cached)), options.prolongCachedResponse)
            )
        } else {
            return func(...args).then((result) => {
                setTimeout(() => { window.localStorage.removeItem(key) }, options.cacheValidityTimeout)
                window.localStorage.setItem(key, JSON.stringify(result))
                return result
            })
        }
    }
}
