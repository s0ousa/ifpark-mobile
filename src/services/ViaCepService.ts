import axios from 'axios';

export const ViaCepService = {
  getAddress: async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return null;
    
    const response = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (response.data.erro) {
      throw new Error("CEP não encontrado");
    }
    return response.data;
  }
};