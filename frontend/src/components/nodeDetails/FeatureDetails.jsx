import { useState } from "react";
import { useLocation } from "react-router";
import { usePopUpContext } from "#contexts/PopUpContext";
import { useTreeContext } from "#contexts/TreeContext";
import { updateFeatureDetails } from "#services/featureServices";

export default function FeatureDetails() {
    const feature = usePopUpContext();
    const [projectData, _] = useTreeContext();
    const [editMode, setEditMode] = useState(false);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [input, setInput] = useState({
        name: feature.name,
        status: feature.status || "",
        assignee: feature.assignee?.id || "",
        dueDate: feature.dueDate?.split("T")[0] || "",
        gitBranch: feature.gitBranch || "",
        description: feature.description || "",
        acceptanceCriteria: feature.acceptanceCriteria || "",
    });

    const handleUpdateFeatureDetails = async () => {
        setError(null);
        setSuccess(null);
        const updatedFeatureDetails = {
            name: input.name,
            status: input.status,
            assigneeId: input.assignee,
            dueDate: input.dueDate || null,
            gitBranch: input.gitBranch.trim(),
            description: input.description.trim(),
            acceptanceCriteria: input.acceptanceCriteria.trim(),
        };

        const response = await updateFeatureDetails(feature.uuid, updatedFeatureDetails);
        if (response.success) {
            const data = response.data;
            // Update the local version of the feature context in case the user wants to edit again.   
            feature.name = data.name;
            feature.status = data.status;
            feature.dueDate = data.dueDate;
            feature.gitBranch = data.gitBranch;
            feature.description = data.description;
            feature.acceptanceCriteria = data.acceptanceCriteria;
            feature.assignee = data.assignee;

            setSuccess(response.message);
            setEditMode(false);
        } else {
            setError(response.message);
        }
    }

    const handleInput = (e) => {
        const field = e.target.name;
        const value = e.target.value;
        setInput((prev) => ({ ...prev, [field]: value }));
    }

    const cancelEditMode = () => {
        // Revert input values to original state
        setInput({
            name: feature.name,
            status: feature.status || "",
            assignee: feature.assignee?.id || "",
            dueDate: feature.dueDate?.split("T")[0] || "",
            gitBranch: feature.gitBranch || "",
            description: feature.description || "",
            acceptanceCriteria: feature.acceptanceCriteria || "",
        });
        setError(null);
        setSuccess(null);
        setEditMode(false);
    }

    return (
        <div className="h-9/12 w-full text-gray-300 relative">
            <div className="text-red-300 mt-2 text-center">{error}</div>
            <div className="text-green-300 mt-2 text-center">{success}</div>

            {/* Header with Edit/Save Toggle */}
            <div className="flex items-center mb-4 px-26">
                <div className="text-2xl font-bold">Feature Details</div>
                <div className="grow flex justify-end">
                    <button
                        onClick={editMode ? handleUpdateFeatureDetails : () => setEditMode(true)}
                        className="button-update px-4 py-1 text-white rounded-md"
                    >
                        {editMode ? "Save" : "Edit"}
                    </button>
                    {editMode && (
                        <button
                            onClick={cancelEditMode}
                            className="button-cancel ml-6 px-4 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            <div className="px-26">
                <div className="text-xl">Feature name:</div>
                {editMode ? (
                    <input
                        type="text"
                        name="name"
                        value={input.name}
                        onChange={handleInput}
                        className="flex items-center h-12 rounded-md font-mono text-gray-100 text-lg px-4 bg-gray-600 outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        placeholder="Enter feature name"
                    />
                ) : (
                    <div className="flex flex-col justify-center h-16 rounded-md text-gray-200 text-center text-xl px-4 bg-gray-700 border-2 border-gray-400">
                        {feature.name}
                    </div>)}
            </div>

            <div className="h-[80%] w-full px-26 scroller-slim mt-4">
                {/* Metadata Grid (Status, Assignee, Due Date) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    {/* Status */}
                    <div>
                        <div className="text-xl text-gray-400 mb-1">Status</div>
                        <div className="h-12 flex items-center justify-center p-2 rounded-md bg-gray-700 text-lg">
                            {editMode ? (
                                <select name="status" value={input.status} onChange={handleInput} className="w-full bg-gray-800 border border-purple-200 rounded-md p-1 outline-none text-center">
                                    <option value="">Change Status</option>
                                    <option value="open">Open</option>
                                    <option value="inWork">In Work</option>
                                    <option value="done">Done</option>
                                </select>
                            ) : (
                                feature.status || 'Not set'
                            )}
                        </div>
                    </div>

                    {/* Assignee */}
                    <div>
                        <div className="text-xl text-gray-400 mb-1">Assignee</div>
                        <div className="h-12 flex items-center justify-center p-2 rounded-md bg-gray-700 text-lg">
                            {editMode ? (
                                <select name="assignee" value={input.assignee} onChange={handleInput} className="w-full bg-gray-800 border border-purple-200 rounded-md p-1 outline-none text-center">
                                    <option value="">Unassigned</option>
                                    {projectData.projectNode.users.map(user => (
                                        <option key={user.id} value={user.id}>{user.displayName}</option>
                                    ))}
                                </select>
                            ) : (
                                feature.assignee?.displayName || 'Unassigned'
                            )}
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <div className="text-xl text-gray-400 mb-1">Due Date</div>
                        <div className="h-12 flex items-center justify-center p-2 rounded-md bg-gray-700 text-lg">
                            {editMode ? (
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={input.dueDate}
                                    onChange={handleInput}
                                    className="w-full bg-gray-800 border border-purple-200 rounded-md p-1 outline-none text-center"
                                />
                            ) : (
                                feature.dueDate?.split('T')[0] || 'Not set'
                            )}
                        </div>
                    </div>
                </div>

                {/* Git Branch */}
                <div className="text-xl mt-6 mb-1">Git Branch:</div>
                {editMode ? (
                    <input
                        type="text"
                        name="gitBranch"
                        value={input.gitBranch}
                        onChange={handleInput}
                        className="flex items-center h-12 rounded-md font-mono text-gray-100 text-lg px-4 bg-gray-600 outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        placeholder="Enter git branch"
                    />
                ) : (
                    <div className="flex items-center h-12 rounded-md font-mono text-gray-100 text-lg px-4 bg-gray-700 w-full">
                        {feature.gitBranch || 'No gitBranch provided.'}
                    </div>
                )}

                {/* Description */}
                <div className="text-xl mt-6 mb-1">Description:</div>
                {editMode ? (
                    <textarea
                        name="description"
                        value={input.description}
                        onChange={handleInput}
                        className="min-h-[150px] w-full resize-y bg-gray-600 p-4 text-xl rounded-md outline-none focus:ring-2 focus:ring-blue-500 scroller-slim"
                        placeholder="Enter description..."
                    />
                ) : (
                    <div className="min-h-[150px] whitespace-pre-wrap w-full bg-gray-700 p-4 text-xl rounded-md scroller-slim">
                        {feature.description || 'No description provided.'}
                    </div>
                )}

                {/* Acceptance Criteria */}
                <div className="text-xl mt-6 mb-1">Acceptance Criteria:</div>
                {editMode ? (
                    <textarea
                        name="acceptanceCriteria"
                        value={input.acceptanceCriteria}
                        onChange={handleInput}
                        className="min-h-[150px] w-full resize-y bg-gray-600 p-4 text-xl rounded-md outline-none focus:ring-2 focus:ring-blue-500 scroller-slim mb-8"
                        placeholder="Enter acceptance criteria..."
                    />
                ) : (
                    <div className="min-h-[150px] w-full whitespace-pre-wrap bg-gray-700 p-4 text-xl rounded-md scroller-slim mb-8">
                        {feature.acceptanceCriteria || 'No acceptance criteria provided.'}
                    </div>
                )}
            </div>
        </div>
    );
}
