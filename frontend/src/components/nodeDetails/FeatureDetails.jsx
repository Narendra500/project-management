import { useState } from "react";
import { usePopUpContext } from "#contexts/PopUpContext";

export default function FeatureDetails() {
    const feature = usePopUpContext();
    const [requestToDeleteFeature, setRequestToDeleteFeature] = useState(false);

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
                        <div className="p-2 rounded-md bg-gray-700 text-lg">{feature.status || 'Not set'}</div>
                    </div>
                    <div>
                        <div className="text-xl text-gray-400">Assignee</div>
                        <div className="p-2 rounded-md bg-gray-700 text-lg">{feature.assignee?.displayName || 'Unassigned'}</div>
                    </div>
                    <div>
                        <div className="text-xl text-gray-400">Due Date</div>
                        {/* split the date from the timezone, eg: 2025-06-19T00:00:000Z to 2025-06-19 */}
                        <div className="p-2 rounded-md bg-gray-700 text-lg">{feature.dueDate?.split('T')[0] || 'Not set'}</div>
                    </div>
                </div>

                <div className="text-xl mt-4">Git Branch:</div>
                <div className="flex items-center h-12 rounded-md font-mono text-gray-100 text-lg px-4 bg-gray-700">{feature.gitBranch}</div>

                <div className="text-xl mt-4">Description:</div>
                <div className="h-5/12 whitespace-pre-wrap bg-gray-700 p-4 text-xl rounded-md scroller-slim">
                    {feature.description || 'No description provided.'}
                </div>

                <div className="text-xl mt-4">Acceptance Criteria:</div>
                <div className="h-5/12 whitespace-pre-wrap bg-gray-700 p-4 text-xl rounded-md scroller-slim">
                    {feature.acceptanceCriteria || 'No acceptance criteria provided.'}
                </div>
                {
                    !requestToDeleteFeature &&
                    <button className="button-delete m-auto" onClick={() => setRequestToDeleteFeature(true)}>
                        Delete feature
                    </button>
                }
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
