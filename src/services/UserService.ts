import api from './api';
import { UpdateUserData } from '../types/User';

export const UserService = {
    getUserById: async (userId: string) => {
        try {
            const response = await api.get(`/usuarios/${userId}`);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Erro ao buscar usuário");
            }
            throw new Error("Erro de conexão com o servidor");
        }
    },

    updateUser: async (userId: string, data: UpdateUserData) => {
        try {
            const response = await api.put(`/usuarios/${userId}`, data);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Erro ao atualizar usuário");
            }
            throw new Error("Erro de conexão com o servidor");
        }
    }
};
