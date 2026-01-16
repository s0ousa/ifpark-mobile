import api from './api';

type ParkingLot = {
    id: string;
    nome: string;
    capacidadeTotal: number;
    vagasOcupadas: number;
    vagasLivres: number;
    ativo: boolean;
    campus: {
        id: string;
        nome: string;
    };
};

type ParkingLotResponse = {
    content: ParkingLot[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
};

export const ParkingLotService = {
    getParkingLotsByCampus: async (campusId: string): Promise<ParkingLotResponse> => {
        try {
            const response = await api.get(`/estacionamentos?campus=${campusId}`);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Erro ao buscar estacionamentos");
            }
            throw new Error("Erro de conexão com o servidor");
        }
    },

    getParkingLotById: async (parkingLotId: string): Promise<ParkingLot> => {
        try {
            const response = await api.get(`/estacionamentos/${parkingLotId}`);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Erro ao buscar estacionamento");
            }
            throw new Error("Erro de conexão com o servidor");
        }
    },

    createParkingLot: async (data: {
        nome: string;
        campusId: string;
        capacidadeTotal: number;
    }): Promise<ParkingLot> => {
        try {
            const response = await api.post('/estacionamentos', data);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Erro ao criar estacionamento");
            }
            throw new Error("Erro de conexão com o servidor");
        }
    },

    updateParkingLot: async (parkingLotId: string, data: {
        nome: string;
        capacidadeTotal: number;
    }): Promise<ParkingLot> => {
        try {
            const response = await api.put(`/estacionamentos/${parkingLotId}`, data);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Erro ao atualizar estacionamento");
            }
            throw new Error("Erro de conexão com o servidor");
        }
    },

    toggleParkingLotStatus: async (parkingLotId: string, ativo: boolean): Promise<ParkingLot> => {
        try {
            const response = await api.patch(`/estacionamentos/${parkingLotId}/status?ativo=${ativo}`);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Erro ao alterar status do estacionamento");
            }
            throw new Error("Erro de conexão com o servidor");
        }
    }
};

export type { ParkingLot, ParkingLotResponse };
