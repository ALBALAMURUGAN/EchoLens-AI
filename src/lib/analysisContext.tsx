import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Analysis } from "./audio";
import { loadLibrary, removeFromLibrary, saveToLibrary } from "./store";

interface AnalysisContextValue {
  library: Analysis[];
  current: Analysis | null;
  setCurrent: (a: Analysis | null) => void;
  saveCurrent: (a: Analysis) => void;
  removeAnalysis: (id: string) => void;
}

const AnalysisContext = createContext<AnalysisContextValue>({
  library: [], current: null, setCurrent: () => {}, saveCurrent: () => {}, removeAnalysis: () => {},
});

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState<Analysis[]>([]);
  const [current, setCurrent] = useState<Analysis | null>(null);

  useEffect(() => { setLibrary(loadLibrary()); }, []);

  const saveCurrent = useCallback((a: Analysis) => {
    setCurrent(a);
    setLibrary(saveToLibrary(a));
  }, []);
  const removeAnalysis = useCallback((id: string) => {
    setLibrary(removeFromLibrary(id));
    setCurrent(c => (c && c.id === id ? null : c));
  }, []);

  return (
    <AnalysisContext.Provider value={{ library, current, setCurrent, saveCurrent, removeAnalysis }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export const useAnalysis = () => useContext(AnalysisContext);
