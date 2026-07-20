import { api } from "../lib/api";

export const mapService = {
  getActiveMap: async () => {
    return await api.get("/api/maps");
  },
  
  getAllMaps: async () => {
    return await api.get("/api/maps/all");
  },
  
  getRooms: async () => {
    return await api.get("/api/maps/rooms");
  },
  
  createRoomInstance: async (name, mapId) => {
    return await api.post("/api/maps/rooms", { name, mapId });
  },

  updateRoomInstance: async (id, name, mapId) => {
    return await api.put(`/api/maps/rooms/${id}`, { name, mapId });
  },
  
  deleteRoomInstance: async (id) => {
    return await api.delete(`/api/maps/rooms/${id}`);
  },
  
  createRoom: async (name) => {
    return await api.post("/api/maps/create", { name });
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
