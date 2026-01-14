export type Vehicle = {
    id: string;
    placa: string;
    modelo: string;
    statusAprovacao: 'APROVADO' | 'PENDENTE' | 'REJEITADO';
};

export type Driver = {
    id: string;
    nome: string;
    cpf: string;
    tipo: 'ALUNO' | 'SERVIDOR' | 'VISITANTE';
    telefone: string;
    status: 'ATIVO' | 'PENDENTE' | 'INATIVO';
    veiculos: Vehicle[];
};

export type DriversResponse = {
    content: Driver[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
};
