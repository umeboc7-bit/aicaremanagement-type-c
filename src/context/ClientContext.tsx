import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ClientData {
  patternA?: any;
  patternB?: any;
  checkboxes?: Record<string, boolean>;
  selects?: Record<string, string>;
  carePlan1?: any;
  carePlan2?: any;
  carePlan3?: any;
  carePlan4?: any;
  carePlan5?: any;
  carePlan6?: any;
  smallScalePlan?: any;
  familySummary?: any;
  meetingMinutes?: any;
  assessment23?: any;
  voiceIntake?: any;
}

interface ClientContextType {
  clientData: ClientData | null;
  saveClientData: (data: ClientData) => void;
  clearClientData: () => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientData, setClientData] = useState<ClientData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('careClientData');
    if (saved) {
      try {
        setClientData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved client data", e);
      }
    }
  }, []);

  const saveClientData = (data: ClientData) => {
    // Merge with existing data
    setClientData(prev => {
      const newData = { ...prev, ...data };
      localStorage.setItem('careClientData', JSON.stringify(newData));
      return newData;
    });
  };

  const clearClientData = () => {
    setClientData(null);
    localStorage.removeItem('careClientData');
  };

  return (
    <ClientContext.Provider value={{ clientData, saveClientData, clearClientData }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};
