import api from './api';

export const CampusService = {
  findAll: async () => {
    try {
      const response = await api.get('/campus');
      return response.data;
    } catch (error) {
      console.error("Erro no CampusService:", error);
      throw error;
    }
  }
};