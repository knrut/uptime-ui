export async function api(path, options = {}) {
    const res = await fetch(path, {
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
    });

    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
        // eslint-disable-next-line no-unused-vars
    } catch (e) {
        // ignore invalid JSON
    }

    if (!res.ok) {
        const err = new Error(
            res.status === 401
                ? "Username or password are not valid"
                : data?.message || `Request failed (${res.status})`
        );

        err.status = res.status;
        err.data = data; // { error, message, fields }
        throw err;
    }

    return data;
}
