import { api } from "../lib/api";

export const catsService = {
  getAll: async () => {
    return await api.get("/api/cats");
  },
  
  getById: async (id) => {
    return await api.get(`/api/cats/${id}`);
  },
  
  create: async (formData) => {
    return await api.post("/api/cats", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  
  update: async (id, formData) => {
    return await api.put(`/api/cats/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  
  delete: async (id) => {
    return await api.delete(`/api/cats/${id}`);
  },

  // Placement APIs
  getPlacements: async () => {
    return await api.get("/api/cats/placements");
  },
  
  placeCat: async (cat, slotIndex) => {
    return await api.post("/api/cats/placements", { cat, slotIndex });
  },
  
  pickupCat: async (slotIndex) => {
    return await api.delete(`/api/cats/placements/${slotIndex}`);
  },

  // Inventory APIs
  getUserInventory: async () => {
    return await api.get("/api/cats/inventory");
  },

  addCatToInventory: async (catId) => {
    return await api.post("/api/cats/inventory", { catId });
  },
};
