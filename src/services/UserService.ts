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
    },

    updatePhone: async (pessoaId: string, telefone: string) => {
        try {
            const response = await api.put(`/pessoas/${pessoaId}`, { telefone });
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Erro ao atualizar telefone");
            }
            throw new Error("Erro de conexão com o servidor");
        }
    },

    updateAddress: async (enderecoId: string, endereco: any) => {
        try {
            const response = await api.put(`/enderecos/${enderecoId}`, endereco);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Erro ao atualizar endereço");
            }
            throw new Error("Erro de conexão com o servidor");
        }
    },

    getDrivers: async (page: number = 0, size: number = 10) => {
        try {
            const response = await api.get(`/pessoas/motoristas?page=${page}&size=${size}`);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Erro ao buscar motoristas");
            }
            throw new Error("Erro de conexão com o servidor");
        }
    }
};
