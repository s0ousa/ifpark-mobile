export type Pessoa = {
    id: string;
    nome: string;
    cpf: string;
    matricula: string;
    tipo: 'ALUNO' | 'SERVIDOR' | 'VISITANTE';
    status: 'ATIVO' | 'PENDENTE' | 'REJEITADO';
    telefone: string;
    veiculos?: Array<{
        id: string;
        placa: string;
        modelo: string;
        statusAprovacao: 'APROVADO' | 'PENDENTE' | 'REJEITADO';
    }>;
};

export type Campus = {
    id: string;
    nome: string;
    endereco: string | null;
};

export type Endereco = {
    id: string;
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
};

export type UserProfile = {
    id: string;
    email: string;
    papel: 'ROLE_COMUM' | 'ROLE_VIGIA' | 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN';
    pessoa: Pessoa;
    campus: Campus;
    endereco: Endereco;
};

export type UpdateUserData = {
    telefone?: string;
    matricula?: string;
    papel?: 'ROLE_COMUM' | 'ROLE_VIGIA' | 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN';
    status?: 'ATIVO' | 'PENDENTE' | 'REJEITADO';
    endereco?: Partial<Endereco>;
    campusId?: string;
};
