import { createContext, useContext } from 'react';

// Create the context with a default value
const ProjectsContext = createContext(null);

// Create a custom hook for easy access to the context
export function useProjectsContext() {
    const context = useContext(ProjectsContext);
    if (!context) {
        throw new Error('useProjectsContext must be used with a ProjectsProvider');
    }
    return context;
}

export default ProjectsContext;
