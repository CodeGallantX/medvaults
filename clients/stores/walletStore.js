// stores/walletStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/assets/api";

export const useWalletStore = create(
  persist(
    (set) => ({
      wallet: null,
      isLoading: false,
      error: null,

      fetchWallet: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get("/wallet/");
          set({
            wallet: response.data,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error.response?.data || "Failed to fetch wallet",
            isLoading: false,
          });
        }
      },

      createWallet: async (pin, walletName) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/create_wallet/", {
            pin,
            wallet_name: walletName,
          });
          set({
            wallet: response.data,
            isLoading: false,
          });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data || "Failed to create wallet",
            isLoading: false,
          });
          throw error;
        }
      },

      clearWallet: () => {
        set({ wallet: null });
      },
    }),
    {
      name: "wallet-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ wallet: state.wallet }), // Only persist wallet data
    }
  )
);
