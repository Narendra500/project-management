import NavButton from "#components/ui/NavButton";
import { getUserProjects } from "#services/projectServices";
import { Outlet, useLoaderData, useLocation } from "react-router";
import { useState } from "react";
import DeletedProjectCard from "#components/cards/DeletedProjectCard";
import ProjectsContext from "#contexts/ProjectsContext";

export async function loader() {
    const response = await getUserProjects();
    if (response.success) {
        return response.data;
    }
    return response.message;
}

export default function ProjectsComponenet() {
    const projectsLoaded = useLoaderData(); // gets all user project
    const [projects, setProjects] = useState(projectsLoaded); // sets the list of project as a state so anychanges to the list will trigger rerender

    return (
        <ProjectsContext.Provider value={{ projects, setProjects }} >
            <div className="h-full flex flex-col">
                {/* heading */}
                <div className="shrink-0 h-16 sm:h-36 flex mt-6 sm:mt-0 w-full justify-center items-center border-b-1 border-b-gray-700 py-[2%]">
                    <h1 className="mt-2 sm:mt-0 text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-0 text-red-500">Your Deleted Project's</h1>
                </div>
                {/* headings for the columns */}
                <div className="hidden md:block w-full">
                    <DeletedProjectCard key={1} id={1}>{{ name: "Project Name:", role: "Role:", isHeading: true }}</DeletedProjectCard>
                </div>
                {/* projects */}
                <div className="w-full grow scroller">
                    {projects.map(project => project.isDeleted === true ? <DeletedProjectCard key={project.uuid} id={project.uuid}>{project}</DeletedProjectCard> : "")}
                </div>
                {/* popup */}
                <Outlet />
            </div>
        </ProjectsContext.Provider>
    );
}
