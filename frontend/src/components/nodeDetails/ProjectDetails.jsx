import { useTreeContext } from "#contexts/TreeContext";
import { useNavigate } from "react-router";

export default function ProjectDetails() {
    const [treeData, setTreeData] = useTreeContext();
    const navigate = useNavigate();
    const projectDetails = treeData.projectNode;

    const handleAddMember = () => {
        navigate(`/tree-view/${projectDetails.uuid}/node/${projectDetails.uuid}/invite-users`, { replace: true });
    }

    return (
        <div className="h-[86%] w-10/12 overflow-auto">
            <div className="text-center text-3xl font-bold">Project Details</div>
            <div className="scroller-slim">
                <div className="text-2xl text-gray-300">Project name:</div>
                <div className="flex flex-col justify-center h-16 rounded-md text-gray-200 text-xl text-center bg-gray-700">{projectDetails.name}</div>
                <div className="text-2xl mt-4 text-gray-300">Project description:</div>
                <div className="h-100 whitespace-pre-wrap mb-6 bg-gray-700 p-4 text-xl text-gray-200 rounded-md scroller-slim">
                    {projectDetails.description || "Category description not provided"}
                </div>
                <div className="flex justify-baseline mb-4 items-center">
                    <div className="text-2xl mt-4 text-gray-300 inline">Project members:</div>
                    <button className="button-square-small ml-6 inline" onClick={handleAddMember}>Add</button>
                </div>
                {projectDetails.users?.map(user => <div key={`${user.name}`} className="flex flex-col justify-center h-12 rounded-md text-gray-200 text-xl pl-4 bg-gray-700">{user.displayName} ({user.name})</div>)}
            </div>
        </div>
    );
}
