
// This hook is now a no-op. Console log capturing has been removed due to recursion and error issues.

export const useConsoleLogs = () => {
  return {
    logs: [],
    clearLogs: () => {},
    associateWithElement: false,
    setAssociateWithElement: () => {},
    getFilteredLogs: () => [], // Add missing function that returns empty array
  };
};
