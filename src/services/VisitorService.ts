import api from './api';

export type VisitorRegistrationData = {
    // Dados pessoais
    nome: string;
    cpf: string;
    tipo: 'VISITANTE';
    telefone: string;

    // Endereço
    cep: string;
    cidade: string;
    estado: string;
    logradouro: string;
    numero: string;
    bairro: string;

    // Veículo
    placa: string;
    modelo: string;
};

export type VisitorResponse = {
    id: string;
    nome: string;
    cpf: string;
    tipo: 'VISITANTE';
    telefone: string;
    status: string;
};

export const VisitorService = {
    registerVisitor: async (data: VisitorRegistrationData): Promise<VisitorResponse> => {
        try {
            const response = await api.post('/pessoas/visitantes', data);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                const errorData = error.response.data;

                // Se houver erros de validação de campos
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    const errorMessages = errorData.errors
                        .map((err: any) => err.message)
                        .join('\n');
                    throw new Error(errorMessages);
                }

                // Se houver mensagem de erro geral
                if (errorData.error) {
                    throw new Error(errorData.error);
                }

                throw new Error("Erro ao registrar visitante");
            }
            throw new Error("Erro de conexão com o servidor");
        }
    }
};
