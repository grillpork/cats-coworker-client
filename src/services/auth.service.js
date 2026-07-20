import { api } from "../lib/api";

export const authServices = {
    login: async (email, password) => {
        const res = await api.post('/api/auth/login', {
            email,
            password
        })
        return res
    },
    register: async (email, password) => {
        const res = await api.post('/api/auth/register', {
            email,
            password
        })
        return res
    },
    logout: async () => {
        const res = await api.post('/api/auth/logout')
        return res
    },
    me: async () => {
        const res = await api.get('/api/auth/me')
        return res
    },
    googleLogin: async (token) => {
        const res = await api.post('/api/auth/google-login', {
            token
        })
        return res
    },
    googleAuth: async (payload) => {
        const res = await api.post('/api/auth/google', payload);
        return res;
    },
    oauthLogin: async (payload) => {
        const res = await api.post('/api/auth/oauth', payload);
        return res;
    },
    getAllUsers: async () => {
        const res = await api.get('/api/user/all');
        return res;
    },
    updateUserRole: async (userId, roleId) => {
        const res = await api.put('/api/user/role', { userId, roleId });
        return res;
    },
    getRoles: async () => {
        const res = await api.get('/api/auth/roles');
        return res;
    },
    getSp: async () => {
        const res = await api.get('/api/user/sp');
        return res;
    },
    updateSp: async (sp) => {
        const res = await api.put('/api/user/sp', { sp });
        return res;
    }
}