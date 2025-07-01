// hooks/useUserData.js
import { useUserStore } from "@/stores/userStore";

export const useUserData = () => {
  const username = useUserStore((state) => state.username);
  const email = useUserStore((state) => state.email);
  const firstName = useUserStore((state) => state.firstName);
  const lastName = useUserStore((state) => state.lastName);
  const isLoading = useUserStore((state) => state.isLoading);
  const error = useUserStore((state) => state.error);
  const fetchUserData = useUserStore((state) => state.fetchUserData);
  const clearUserData = useUserStore((state) => state.clearUserData);

  const fullName = `${firstName} ${lastName}`.trim();

  return {
    username,
    email,
    firstName,
    lastName,
    fullName,
    isLoading,
    error,
    refetchUserData: fetchUserData,
    clearUserData,
  };
};
