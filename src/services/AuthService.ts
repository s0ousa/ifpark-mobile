import api from './api';

export const AuthService = {
  register: async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || "Erro ao cadastrar");
      }
      throw new Error("Erro de conexão com o servidor");
    }
  }
};