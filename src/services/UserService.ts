import api from './api';

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
    }
};
