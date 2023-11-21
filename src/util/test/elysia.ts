export function buildBunRequestBody(url: string, method: string, body: object) {
    return new Request(url, {
        method: method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
    })
}
export function buildBunFormBody(url: string, method: string, body: Record<string, string>, filePath: string) {
    let form = new FormData()
    form.append("file", Bun.file(filePath))
    for (const key of Object.keys(body)) {
        form.set(key, body[key])
    }
    return new Request(url, {
        method: method,
        body: form
    })
}