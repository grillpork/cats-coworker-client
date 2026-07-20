import axios from "axios";
import { getSession, clearSession } from "../utils/session";

const getBaseURL = () => {
    if (typeof window !== "undefined") {
        if (window.location.hostname === "catako.site" || window.location.hostname === "catako.site") {
            return "https://backend-catako.site";
        }
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
};

export const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    },
    timeout: 5000,
    withCredentials: true
});

api.interceptors.request.use(config => {
    const token = getSession();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
},error => {
    return Promise.reject(error)
})

api.interceptors.response.use(res => {
    return res.data
}, error => {
    if (error.response && error.response.status === 401) {
        clearSession();
        if (typeof window !== "undefined") {
            window.location.href = "/auth/sign-in";
        }
    }
    return Promise.reject(error)
})