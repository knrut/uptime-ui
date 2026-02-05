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
        if (res.status === 401) {
            throw new Error("Username or password are not valid");
        }
        throw new Error(data?.message || `Request failed (${res.status})`);
    }

    return data;
}
