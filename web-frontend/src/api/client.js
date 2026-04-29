// API client with auto-retry on 401

let forceLogoutFn = null;
export function setForceLogout(fn) {
    forceLogoutFn = fn;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(method, path, body) {
    const token = localStorage.getItem('token');
    const headers = {};

    if (body && !(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    };

    let res = await fetch(`${API_BASE}${path}`, options);

    // Auto-refresh on 401
    if (res.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
            if (refreshRes.ok) {
                const { accessToken } = await refreshRes.json();
                localStorage.setItem('token', accessToken);
                options.headers['Authorization'] = `Bearer ${accessToken}`;
                res = await fetch(`${API_BASE}${path}`, options);
            } else {
                if (forceLogoutFn) forceLogoutFn();
                throw new Error('Session expired');
            }
        } else {
            if (forceLogoutFn) forceLogoutFn();
            throw new Error('Unauthorized');
        }
    }

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.message || `Error ${res.status}`);
    }

    // 204 No Content
    if (res.status === 204) return null;
    return res.json();
}

const api = {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    delete: (path) => request('DELETE', path),
};

export default api;
