import { createContext, useContext } from 'react';

// Create the context with a default value
const AppContext = createContext(null);

// Create a custom hook for easy access to the context
export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}

export default AppContext;
