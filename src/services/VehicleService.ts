import api from './api';

export type Vehicle = {
    id: string;
    placa: string;
    modelo: string;
    statusAprovacao: 'APROVADO' | 'PENDENTE' | 'REJEITADO';
};

export const VehicleService = {
    register: async (vehicleData: { pessoaId: string, placa: string, modelo: string }) => {
        try {
            const response = await api.post('/veiculos', vehicleData);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Erro ao cadastrar veículo");
            }
            throw new Error("Erro de conexão com o servidor");
        }
    },

    getVehiclesByPessoaId: async (pessoaId: string): Promise<Vehicle[]> => {
        try {
            const response = await api.get(`/veiculos/pessoa/${pessoaId}`);
            // API retorna objeto paginado, extrair o array de content
            return response.data.content || [];
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Erro ao buscar veículos");
            }
            throw new Error("Erro de conexão com o servidor");
        }
    },

    approve: async (veiculoId: string): Promise<void> => {
        try {
            await api.put(`/veiculos/aprovar/${veiculoId}`);
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Erro ao aprovar veículo");
            }
            throw new Error("Erro de conexão com o servidor");
        }
    },

    reject: async (veiculoId: string, motivo: string): Promise<void> => {
        try {
            await api.put(`/veiculos/rejeitar/${veiculoId}`, { motivo });
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Erro ao rejeitar veículo");
            }
            throw new Error("Erro de conexão com o servidor");
        }
    }
};
