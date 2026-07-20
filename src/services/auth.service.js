import { api } from "../lib/api";

export const authServices = {
    login: async (email, password) => {
        const res = await api.post('/login', {
            email,
            password
        })
        return res
    },
    register: async (email, password) => {
        const res = await api.post('/register', {
            email,
            password
        })
        return res
    },
    logout: async () => {
        const res = await api.post('/logout')
        return res
    },
    me: async () => {
        const res = await api.get('/me')
        return res
    },
    googleLogin: async (token) => {
        const res = await api.post('/google-login', {
            token
        })
        return res
    }
}