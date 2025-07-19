// application/hooks/useNetworkConnection.ts
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  hasRealInternetAccess: boolean;
}

export const useNetworkConnection = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
    hasRealInternetAccess: true, // asumir que sí al inicio
  });

  useEffect(() => {
    checkInitialConnection();

    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const realInternet = await validateInternetAccess();
      console.log('🌐 Estado de red:', {
        connected: state.isConnected,
        reachable: state.isInternetReachable,
        type: state.type,
        realInternet,
      });

      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        hasRealInternetAccess: realInternet,
      });
    });

    return () => unsubscribe();
  }, []);

  const checkInitialConnection = async () => {
    try {
      const state = await NetInfo.fetch();
      const realInternet = await validateInternetAccess();
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        hasRealInternetAccess: realInternet,
      });
    } catch (error) {
      console.error('Error verificando conexión inicial:', error);
      setNetworkState(prev => ({ ...prev, isConnected: true, hasRealInternetAccess: false }));
    }
  };

  const checkConnection = async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      const realInternet = await validateInternetAccess();
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        hasRealInternetAccess: realInternet,
      });
      return realInternet;
    } catch (error) {
      console.error('Error verificando conexión:', error);
      return false;
    }
  };

  // Validación adicional con fetch real
  const validateInternetAccess = async (): Promise<boolean> => {
    try {
      const response = await fetch('https://clients3.google.com/generate_204', {
        method: 'GET',
        cache: 'no-cache',
      });
      return response.status === 204;
    } catch (error) {
      return false;
    }
  };

  return {
    isConnected: networkState.isConnected,
    isInternetReachable: networkState.isInternetReachable,
    connectionType: networkState.type,
    hasRealInternetAccess: networkState.hasRealInternetAccess,
    checkConnection,
  };
};
