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

  listCampuses: async (): Promise<any> => {
    try {
      console.log('CampusService: Fazendo requisição GET /campus');
      const response = await api.get('/campus');
      console.log('CampusService: Resposta recebida:', response.data);
      return response.data; // Returns the full paginated response { content: [...], pageable: {...}, ... }
    } catch (error: any) {
      console.error('CampusService: Erro na requisição:', error);
      console.error('CampusService: Error response:', error.response);

      if (error.response && error.response.data) {
        const message = error.response.data.message || error.response.data.error || 'Erro ao listar campi';
        throw new Error(`${message} (Status: ${error.response.status})`);
      }
      if (error.message) {
        throw new Error(`Erro de conexão: ${error.message}`);
      }
      throw new Error('Erro de conexão com o servidor');
    }
  },

  // Public endpoint - no authentication required
  listActiveCampuses: async (): Promise<any> => {
    try {
      console.log('CampusService: Fazendo requisição GET /campus/ativos (público)');
      const response = await api.get('/campus/ativos');
      console.log('CampusService: Resposta recebida:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('CampusService: Erro na requisição:', error);
      console.error('CampusService: Error response:', error.response);

      if (error.response && error.response.data) {
        const message = error.response.data.message || error.response.data.error || 'Erro ao listar campi ativos';
        throw new Error(`${message} (Status: ${error.response.status})`);
      }
      if (error.message) {
        throw new Error(`Erro de conexão: ${error.message}`);
      }
      throw new Error('Erro de conexão com o servidor');
    }
  },

  // Legacy method for compatibility - uses public endpoint for registration
  findAll: async () => {
    return CampusService.listActiveCampuses();
  }
};