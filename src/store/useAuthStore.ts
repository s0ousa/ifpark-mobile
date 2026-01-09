import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/AuthService';

type User = {
    id: string;
    email: string;
    papel: 'ROLE_COMUM' | 'ROLE_VIGIA' | 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN' | string;
    pessoa?: {
        nome: string;
    };
};

type AuthState = {
    user: User | null;
    token: string | null;
    loading: boolean;
    signIn: (credentials: any) => Promise<void>;
    signOut: () => Promise<void>;
    initialize: () => Promise<void>;
};

const STORAGE_USER_KEY = '@IfPark:user';
const STORAGE_TOKEN_KEY = '@IfPark:token';

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    loading: true,

    initialize: async () => {
        try {
            const [storedUser, storedToken] = await Promise.all([
                AsyncStorage.getItem(STORAGE_USER_KEY),
                AsyncStorage.getItem(STORAGE_TOKEN_KEY),
            ]);

            if (storedUser && storedToken) {
                set({
                    user: JSON.parse(storedUser),
                    token: storedToken,
                    loading: false
                });
            } else {
                set({ loading: false });
            }
        } catch (error) {
            console.error("Erro ao carregar dados do usuário:", error);
            set({ loading: false });
        }
    },

    signIn: async (credentials: any) => {
        try {
            const response = await AuthService.login(credentials);

            const userData: User = {
                id: response.id,
                email: response.email,
                papel: response.role,
            };
            await Promise.all([
                AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData)),
                AsyncStorage.setItem(STORAGE_TOKEN_KEY, response.token),
            ]);

            set({ user: userData, token: response.token });
        } catch (error) {
            throw error;
        }
    },

    signOut: async () => {
        await Promise.all([
            AsyncStorage.removeItem(STORAGE_USER_KEY),
            AsyncStorage.removeItem(STORAGE_TOKEN_KEY),
        ]);
        set({ user: null, token: null });
    },
}));
