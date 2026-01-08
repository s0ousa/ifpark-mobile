import api from './api';

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
    }
};
