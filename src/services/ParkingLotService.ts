import api from './api';

type ParkingLot = {
    id: string;
    nome: string;
    capacidadeTotal: number;
    vagasOcupadas: number;
    vagasLivres: number;
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
    }
};

export type { ParkingLot, ParkingLotResponse };
