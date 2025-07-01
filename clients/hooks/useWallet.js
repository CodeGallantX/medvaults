// hooks/useWallet.js
import { useWalletStore } from "../stores/walletStore";

export const useWallet = () => {
  const { wallet, isLoading, error, fetchWallet, createWallet, clearWallet } =
    useWalletStore();

  return {
    wallet,
    isLoading,
    error,
    fetchWallet,
    createWallet,
    clearWallet,
    hasWallet: !!wallet,
    balance: wallet?.user_balance || "0.00",
    walletName: wallet?.wallet_name || "",
    createdAt: wallet?.created_at || "",
  };
};
