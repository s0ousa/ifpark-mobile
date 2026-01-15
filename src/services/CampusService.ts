import api from './api';

export interface Campus {
  id: string;
  nome: string;
  endereco: {
    id: string;
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  totalUsuarios: number;
  quantidadeEstacionamentos: number;
  totalVagas: number;
  totalVagasOcupadas: number;
  totalVagasLivres: number;
}

export const CampusService = {
  getCampusById: async (campusId: string): Promise<Campus> => {
    try {
      const response = await api.get(`/campus/${campusId}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Erro ao buscar campus');
      }
      throw new Error('Erro de conexão com o servidor');
    }
  },

  updateCampus: async (campusId: string, data: {
    nome: string;
    endereco: {
      logradouro: string;
      numero: string;
      complemento: string;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
    }
  }): Promise<Campus> => {
    try {
      const response = await api.put(`/campus/${campusId}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Erro ao atualizar campus');
      }
      throw new Error('Erro de conexão com o servidor');
    }
  },

  // For Super Admin
  createCampus: async (data: {
    nome: string;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
    };
  }): Promise<Campus> => {
    try {
      const response = await api.post('/campus', data);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Erro ao criar campus');
      }
      throw new Error('Erro de conexão com o servidor');
    }
  },

  listCampuses: async (): Promise<Campus[]> => {
    try {
      const response = await api.get('/campus');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Erro ao listar campi');
      }
      throw new Error('Erro de conexão com o servidor');
    }
  },

  // Legacy method for compatibility
  findAll: async () => {
    return CampusService.listCampuses();
  }
};