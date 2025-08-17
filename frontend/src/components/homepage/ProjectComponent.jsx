import NavButton from "#components/ui/NavButton";
import { getUserProjects } from "#services/projectServices";
import { Outlet, useLoaderData } from "react-router";
import { useState } from "react";
import ProjectCard from "#components/cards/ProjectCard";

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
    const [error, setError] = useState(null);

    return (
        <div className="h-full flex flex-col">
            {/* heading */}
            <div className="shrink-0 h-16 sm:h-36 flex mt-6 sm:mt-0 w-full justify-center items-center border-b-1 border-b-gray-700 py-[2%]">
                <h1 className="mt-2 sm:mt-0 text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-0">Your Project's</h1>
                <NavButton navigateTo={"create-user-project"} extraClasses="ml-16 md:ml-32 mb-4 sm:mb-0" buttonText="Create Project" />
                <span className="hidden md:inline text-2xl ml-12 mr-2">Active Project: </span>
                <div className="hidden md:inline h-16 w-16 border-2 border-gray-600 rounded-full bg-violet-950"></div>
            </div>
            {/* headings for the columns */}
            <div className="hidden md:block w-full">
                <ProjectCard key={1} id={1}>{{ name: "Project Name:", role: "Role:", isHeading: true }}</ProjectCard>
            </div>
            {/* projects */}
            <div className="w-full grow scroller">
                {projects.map(project => <ProjectCard key={project.id} id={project.id} >{project}</ProjectCard>)}
            </div>
            {/* popup */}
            <Outlet context={{ projects: [projects, setProjects], error: [error, setError] }} />
        </div>
    );
}
