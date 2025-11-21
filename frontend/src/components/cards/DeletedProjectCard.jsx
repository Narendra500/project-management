import { reverseSoftDeleteUserProject } from "#services/projectServices";
import { useContext } from "react";
import { useProjectsContext } from "#contexts/ProjectsContext";

export default function ProjectCard({ children, id }) {
    const { projects, setProjects } = useProjectsContext();

    const handleReverseSoftDeleteRequest = async () => {
        const response = await reverseSoftDeleteUserProject(id);
        if (response?.success) {
            setProjects(prev =>
                prev.map(project =>
                    project.uuid === id ?
                        { ...project, isDeleted: false, deletedAt: null } :
                        project
                )
            )
        }
    }

    return (
        <div className={`h-fit py-4 lg:h-32 w-full border-b-1 border-b-gray-700 flex flex-col sm:flex-row items-center px-4 ${id === 1 ? "bg-gray-950" : ""}`}>

            {/* Name and Role container */}
            <div className="grow w-full max-w-10/12 flex flex-col lg:flex-row text-2xl lg:text-3xl">
                <div className="lg:w-1/2 pl-3 sm:pl-10">{children.name}</div>
                <div className="text-purple-400 lg:w-1/2 pl-3 pt-3 lg:pt-0 sm:pl-10 lg:pl-0">{children.role}</div>
            </div>

            {/* Actions container */}
            <div className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0 flex justify-center pr-4">
                {
                    id !== 1 ?
                        <button className="flex items-center text-white h-12 justify-center border-2 border-green-500 px-3 py-2 mt-6 md:px-3 md:py-1 font-bold rounded-md hover:cursor-pointer hover:bg-green-500"
                            onClick={handleReverseSoftDeleteRequest}
                        >
                            Restore Project
                        </button> :
                        ""
                }
            </div>
        </div>
    );
};
