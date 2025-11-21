import ActionButton from "#components/ui/ActionButton";
import { softDeleteUserProject, updateActiveProject } from "#services/projectServices";
import { useAppContext } from "#contexts/AppContext";
import { useProjectsContext } from "#contexts/ProjectsContext";

export default function ProjectCard({ children, id }) {
    const { user, setUser } = useAppContext(); // gets user details we are only interested in activeProjectUuid

    const { projects, setProjects } = useProjectsContext();

    const handleSoftDeleteRequest = async () => {
        const response = await softDeleteUserProject(id);
        if (response?.success) {
            setProjects(prev =>
                prev.map(project =>
                    project.uuid === id ?
                        { ...project, isDeleted: true, deletedAt: new Date() } :
                        project
                )
            )
        }
    }

    const addSpecialClassesForHeaingOrActiveProject = () => {
        let extraClass = "";
        if (children.isHeading) extraClass += "bg-gray-950"
        else if (isProjectActive()) extraClass += "bg-violet-950"

        return extraClass;
    }

    const isProjectActive = () => {
        // ensure if is not undefined first
        return id && id === user.activeProjectUuid;
    }

    const toggleProjectActiveStatus = async () => {
        const response = await updateActiveProject(isProjectActive() ? null : id);
        if (response?.success) {
            setUser(prevUser => ({
                ...prevUser,
                activeProjectUuid: response.data.activeProjectUuid
            }))
        }
    }

    return (
        <div className={`h-fit py-4 lg:h-32 w-full border-b-1 border-b-gray-700 flex flex-col sm:flex-row items-center px-4 ${addSpecialClassesForHeaingOrActiveProject()}`}>

            {/* Name and Role container */}
            <div className="grow w-full max-w-10/12 flex flex-col lg:flex-row text-2xl lg:text-3xl">
                <div className="lg:w-1/2 pl-3 sm:pl-10">{children.name}</div>
                <div className="text-purple-400 lg:w-1/2 pl-3 pt-3 lg:pt-0 sm:pl-10 lg:pl-0">{children.role}</div>
            </div>

            {/* Actions container */}
            <div className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0 flex justify-center pr-4">
                <ActionButton
                    action={toggleProjectActiveStatus}
                    buttonText={isProjectActive() ? "Set As Inactive" : "Set As Active"}
                    extraClasses={`${children.isHeading ? "hidden" : ""}`}
                />
                {
                    id !== 1 ?
                        <button className=" flex items-center text-white h-12 justify-center border-2 border-red-500 px-3 py-2 ml-32 mt-6 md:px-3 md:py-1 font-bold rounded-md hover:cursor-pointer hover:bg-red-500"
                            onClick={handleSoftDeleteRequest}
                        >
                            Delete Project
                        </button> :
                        ""
                }
            </div>
        </div>
    );
};
