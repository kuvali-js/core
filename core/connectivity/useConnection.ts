// @kuvali-js/core/connectivity/useConnection.ts

// @kuvali-js/core/hooks/useConnection.ts
import { useState, useEffect } from "react";
import { connectivity, ConnectionStatus } from "./ConnectivityService";

export function useConnection() {
  const [status, setStatus] = useState<ConnectionStatus>(connectivity.status);

  useEffect(() => {
    // Subscription using your new type-safe API
    const handler = (newStatus: ConnectionStatus) => setStatus(newStatus);
    
    connectivity.onConnectionChange(handler);
    
    // Auto-cleanup when component unmounts
    return () => connectivity.offConnectionChange(handler);
  }, []);

  return status;
}
//### END #################################################