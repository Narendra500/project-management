import { createContext, useContext } from 'react';

// Create the context with a default value
const TreeContext = createContext(null);

// Create a custom hook for easy access to the context
export function useTreeContext() {
    const context = useContext(TreeContext);
    if (!context) {
        throw new Error('useTreeContext must be used with a TreeProvider');
    }
    return context;
}

export default TreeContext;
