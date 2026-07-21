import { api } from "../lib/api";

export const characterService = {
  getAll: async () => {
    return await api.get("/api/characters");
  },
  
  create: async (formData) => {
    return await api.post("/api/characters", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  update: async (id, formData) => {
    return await api.put(`/api/characters/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  
  delete: async (id) => {
    return await api.delete(`/api/characters/${id}`);
  },
};
