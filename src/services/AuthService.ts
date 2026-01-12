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
  },

  login: async (credentials: any) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || error.response.data.error || "Erro ao fazer login";
        throw new Error(errorMessage);
      }
      console.log(error);
      throw new Error("Erro de conexão com o servidor de login");
    }
  }
};