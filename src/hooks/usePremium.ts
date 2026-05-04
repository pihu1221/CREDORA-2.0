import { useAuth } from '../contexts/AuthContext';

export function usePremium() {
  const { profile, updateProfile } = useAuth();
  const isPremium = profile?.isPremium || false;

  const upgradeToPremium = async () => {
    await updateProfile({ isPremium: true });
  };

  const resetPremium = async () => {
    await updateProfile({ isPremium: false });
  };

  return { isPremium, upgradeToPremium, resetPremium };
}
