import { api } from "../lib/api";

export const storageService = {
  getStats: async () => {
    return await api.get("/api/storage/stats");
  }
};
