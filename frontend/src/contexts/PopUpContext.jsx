import { createContext, useContext } from 'react';

// Create the context with a default value
const PopUpContext = createContext(null);

// Create a custom hook for easy access to the context
export function usePopUpContext() {
    const context = useContext(PopUpContext);
    if (!context) {
        throw new Error('usePopUpContext must be used with a PopUpProvider');
    }
    return context;
}

export default PopUpContext;
