import { createContext, useContext, useEffect, useState, } from "react";

const AiAccessContext = createContext(null);

export function AiAccessProvider({ children }) {
  const [isAiBlocked, setIsAiBlocked] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

  useEffect(() => {
    function handleAiLimitReached() {
      setIsAiBlocked(true);
      setIsAiDialogOpen(true);
    }

    window.addEventListener(
      "ai-limit-reached",
      handleAiLimitReached
    );

    return () => {
      window.removeEventListener(
        "ai-limit-reached",
        handleAiLimitReached
      );
    };
  }, []);

  function closeAiDialog() {
    setIsAiDialogOpen(false);
  }

  return (
    <AiAccessContext.Provider
      value={{
        isAiBlocked,
        isAiDialogOpen,
        closeAiDialog,
      }}
    >
      {children}
    </AiAccessContext.Provider>
  );
}

export function useAiAccess() {
  const context = useContext(AiAccessContext);

  if (!context) {
    throw new Error(
      "useAiAccess must be used inside AiAccessProvider"
    );
  }

  return context;
}