import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export const useAuth = () => {
  const { user, loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  return {
    user,
    loading,
    error,
    isAuthenticated,
  };
};
