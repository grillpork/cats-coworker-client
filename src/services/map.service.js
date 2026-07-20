import { api } from "../lib/api";

export const mapService = {
  getActiveMap: async () => {
    return await api.get("/api/maps");
  },
  
  getAllMaps: async () => {
    return await api.get("/api/maps/all");
  },
  
  saveMap: async (mapData) => {
    return await api.post("/api/maps", mapData);
  },
  
  getSprites: async () => {
    return await api.get("/api/maps/sprites");
  },
  
  upsertSprite: async (formData) => {
    return await api.post("/api/maps/sprites", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  
  deleteSprite: async (tileId) => {
    return await api.delete(`/api/maps/sprites/${tileId}`);
  },
};
