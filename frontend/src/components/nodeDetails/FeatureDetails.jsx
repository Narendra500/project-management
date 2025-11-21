import { useState } from "react";
import { useLocation } from "react-router";
import { usePopUpContext } from "#contexts/PopUpContext";
import { useTreeContext } from "#contexts/TreeContext";
import { updateFeatureDetails } from "#services/featureServices";

export default function FeatureDetails() {
    const feature = usePopUpContext();
    const projectUuid = useLocation().pathname.split("/")[2];
    const categoryUuid = useLocation().pathname.split("/")[4];
    const featureUuid = useLocation().pathname.split("/")[5];
    const [projectData, setProjectData] = useTreeContext();
    const [requestToDeleteFeature, setRequestToDeleteFeature] = useState(false);
    const [status, setStatus] = useState(feature.status);
    const [assignee, setAssignee] = useState(feature.assignee?.id || "");
    const [dueDate, setDueDate] = useState(feature.dueDate?.split("T")[0] || "");
    const [gitBranch, setGitBranch] = useState(feature.gitBranch || "");
    const [description, setDescription] = useState(feature.description || "");
    const [acceptanceCriteria, setAcceptanceCriteria] = useState(feature.acceptanceCriteria || "");

    const handleUpdateFeatureDetails = async () => {
        const updatedFeatureDetails = {
            status: status || feature.status,
            assigneeId: assignee || feature.assignee.id,
            dueDate: dueDate || null,
            gitBranch: gitBranch.trim(),
            description: description.trim(),
            acceptanceCriteria: acceptanceCriteria.trim(),
        };

        await updateFeatureDetails(projectUuid, categoryUuid, featureUuid, updatedFeatureDetails);
    }

    return (
        <div className="h-9/12 w-full text-gray-300">
            <div className="text-center text-2xl font-bold">Feature Details</div>
            <div className="px-26">
                <div className="text-xl">Feature name:</div>
                <div className="flex flex-col justify-center h-16 rounded-md text-gray-200 text-center text-xl px-4 bg-gray-700 border-2 border-gray-400">{feature.name}</div>
            </div>

            <div className="h-full w-full px-26 scroller-slim">
                {/* Metadata Grid (Status, Assignee, Due Date) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-center">
                    <div>
                        <div className="text-xl text-gray-400">Status</div>
                        <div className="p-2 rounded-md bg-gray-700 text-lg">{feature.status || 'Not set'}
                            <select className="ml-4 border-1 border-purple-200 rounded-md" onChange={(e) => { setStatus(e.target.value) }}>
                                <option name="status" className="bg-gray-800" value="">Change</option>
                                <option name="status" className="bg-gray-800" value="open">Open</option>
                                <option className="bg-gray-800" value="inWork">In Work</option>
                                <option className="bg-gray-800" value="done">Done</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <div className="text-xl text-gray-400">Assignee</div>
                        <div className="p-2 rounded-md bg-gray-700 text-lg">{feature.assignee?.displayName || 'Unassigned'}
                            <select className="ml-4 border-1 border-purple-200 rounded-md" onChange={(e) => { setAssignee(e.target.value) }}>
                                <option value="">Change</option>
                                {projectData.projectNode.users.map(user => <option className="bg-gray-800" value={user.id}>{user.displayName}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <div className="text-xl text-gray-400">
                            Due Date
                        </div>
                        {/* split the date from the timezone, eg: 2025-06-19T00:00:000Z to 2025-06-19 */}
                        <div className="p-2 rounded-md bg-gray-700 text-lg">{feature.dueDate?.split('T')[0] || 'Not set'}</div>
                        <input type="date" onChange={(e) => setDueDate(e.target.value)}></input>
                    </div>
                </div>

                <div className="text-xl mt-4">Git Branch:</div>
                <textarea onChange={(e) => setGitBranch(e.target.value)} className="flex items-center h-12 rounded-md font-mono text-gray-100 text-lg px-4 bg-gray-700 w-full"
                    defaultValue={`${feature.gitBranch ? feature.gitBranch : 'No gitBranch provided.'}`}
                ></textarea>

                <div className="text-xl mt-4">Description:</div>
                <textarea className="h-5/12 whitespace-pre-wrap w-full bg-gray-700 p-4 text-xl rounded-md scroller-slim"
                    onChange={(e) => setDescription(e.target.value)}
                    defaultValue={`${feature.description ? feature.description : 'No description provided.'}`}
                >
                </textarea>

                <div className="text-xl mt-4">Acceptance Criteria:</div>
                <textarea className="h-5/12  w-full whitespace-pre-wrap bg-gray-700 p-4 text-xl rounded-md scroller-slim"
                    onChange={(e) => setAcceptanceCriteria(e.target.value)}
                    defaultValue={`${feature.acceptanceCriteria ? feature.acceptanceCriteria : 'No acceptance criteria provided.'}`}
                >
                </textarea>

                <button className="mx-auto button-update" onClick={handleUpdateFeatureDetails}>
                    Update feature
                </button>
                {
                    !requestToDeleteFeature &&
                    <button className="button-delete m-auto" onClick={() => setRequestToDeleteFeature(true)}>
                        Delete feature
                    </button>}

                {
                    requestToDeleteFeature &&
                    <div>
                        <div className="text-red-500 text-xl text-center mt-6">Are you sure you want to delete this feature?</div>
                        <div className="text-xl mt-3">Enter the name: <span className="bg-gray-950 px-3 font-mono">{feature.name}</span> to delete the feature.</div>
                        <input className="input-delete"></input>
                        <div>
                            <button className="button-delete">Delete</button>
                            <button className="button">Don't delete</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}
