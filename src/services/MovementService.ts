import api from './api';

export type Person = {
    id: string;
    nome: string;
    matricula: string | null;
    tipo: 'ALUNO' | 'SERVIDOR';
    status: 'ATIVO' | 'PENDENTE';
    telefone: string;
};

export type Vehicle = {
    id: string;
    placa: string;
    modelo: string;
    statusAprovacao: 'APROVADO' | 'REJEITADO' | 'PENDENTE';
    motivoRejeicao: string | null;
    pessoa: Person;
};

export type Campus = {
    id: string;
    nome: string;
};

export type ParkingLot = {
    id: string;
    nome: string;
    capacidadeTotal: number;
    campus: Campus;
};

export type Guard = {
    id: string;
    email: string;
    papel: string | null;
    pessoa: Person;
};

export type Movement = {
    id: string;
    dataEntrada: string;
    dataSaida: string | null;
    veiculo: Vehicle;
    estacionamento: ParkingLot;
    vigiaEntrada: Guard;
    vigiaSaida: Guard | null;
};

export type MovementResponse = {
    content: Movement[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            sorted: boolean;
            empty: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
        sorted: boolean;
        empty: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
};

export const MovementService = {
    getMovementsByParkingLot: async (estacionamentoId: string, page: number = 0, size: number = 20): Promise<MovementResponse> => {
        try {
            const response = await api.get(`/movimentacoes?estacionamentoId=${estacionamentoId}&page=${page}&size=${size}`);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Erro ao buscar movimentações");
            }
            throw new Error("Erro de conexão com o servidor");
        }
    }
};
