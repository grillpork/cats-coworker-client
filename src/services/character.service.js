import { api } from "../lib/api";

export const characterService = {
  getAll: async () => {
    return await api.get("/api/characters");
  },
  
  create: async (name, avatarUrl) => {
    return await api.post("/api/characters", { name, avatarUrl });
  },
  
  delete: async (id) => {
    return await api.delete(`/api/characters/${id}`);
  },
};
