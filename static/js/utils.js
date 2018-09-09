export function isEmpty (something) {
    return Object.keys(something).length === 0
}

export function handleAPIResponse (resp) {
    if (!resp.ok) {
        return resp.json().then(data => Promise.reject(data))
    }
    return resp.json()
}
