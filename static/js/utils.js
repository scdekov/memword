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

export function authFetch (url, params = {}) {
    let resultParams = copyObj(params)
    if (!resultParams['headers']) {
        resultParams['headers'] = {}
    }
    resultParams['headers']['X-CSRFToken'] = Cookie.get('csrftoken')
    return fetch(url, resultParams)
}

function copyObj (obj) {
    return JSON.parse(JSON.stringify(obj))
}
