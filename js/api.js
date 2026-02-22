// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Get stored token
function getToken() {
    return localStorage.getItem('auth_token');
}

// Set stored token
function setToken(token) {
    localStorage.setItem('auth_token', token);
}

// Clear stored token
function clearToken() {
    localStorage.removeItem('auth_token');
}

// Get auth headers
function getAuthHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

// API Helper
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: getAuthHeaders(),
        ...options
    };

    try {
        const response = await fetch(url, defaultOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API Error');
        }

        return data;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
}

// Authentication API Calls
const AuthAPI = {
    register: (email, password, name) =>
        apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name })
        }),

    login: (email, password) =>
        apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),

    getMe: () =>
        apiCall('/auth/me'),

    logout: () => {
        clearToken();
        localStorage.removeItem('user_data');
    }
};

// Events API Calls
const EventsAPI = {
    getAll: (type, search, page = 1, limit = 10) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (search) params.append('search', search);
        params.append('page', page);
        params.append('limit', limit);
        return apiCall(`/events?${params}`);
    },

    getById: (id) =>
        apiCall(`/events/${id}`),

    create: (event) =>
        apiCall('/events', {
            method: 'POST',
            body: JSON.stringify(event)
        }),

    update: (id, event) =>
        apiCall(`/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(event)
        }),

    delete: (id) =>
        apiCall(`/events/${id}`, { method: 'DELETE' }),

    register: (eventId, registration) =>
        apiCall(`/events/${eventId}/register`, {
            method: 'POST',
            body: JSON.stringify(registration)
        })
};

// Groups API Calls
const GroupsAPI = {
    getAll: (search, page = 1, limit = 10) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        params.append('page', page);
        params.append('limit', limit);
        return apiCall(`/groups?${params}`);
    },

    getById: (id) =>
        apiCall(`/groups/${id}`),

    create: (group) =>
        apiCall('/groups', {
            method: 'POST',
            body: JSON.stringify(group)
        }),

    update: (id, group) =>
        apiCall(`/groups/${id}`, {
            method: 'PUT',
            body: JSON.stringify(group)
        }),

    delete: (id) =>
        apiCall(`/groups/${id}`, { method: 'DELETE' }),

    join: (groupId, joinData) =>
        apiCall(`/groups/${groupId}/join`, {
            method: 'POST',
            body: JSON.stringify(joinData)
        })
};

// Rhapsody API Calls
const RhapsodyAPI = {
    getAll: (search, page = 1, limit = 10) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        params.append('page', page);
        params.append('limit', limit);
        return apiCall(`/rhapsody?${params}`);
    },

    getById: (id) =>
        apiCall(`/rhapsody/${id}`),

    create: (formData) =>
        apiCall('/rhapsody', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        }),

    update: (id, formData) =>
        apiCall(`/rhapsody/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        }),

    delete: (id) =>
        apiCall(`/rhapsody/${id}`, { method: 'DELETE' })
};

// Export for use
export { AuthAPI, EventsAPI, GroupsAPI, RhapsodyAPI, getToken, setToken, clearToken };