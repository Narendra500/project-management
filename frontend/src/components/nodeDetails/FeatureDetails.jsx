import { usePopUpContext } from "#contexts/PopUpContext";

export default function FeatureDetails() {
    const feature = usePopUpContext();

    return (
        <div className="h-[86%] w-10/12 text-gray-300">
            <div className="text-xl">Feature name:</div>
            <div className="flex flex-col justify-center h-16 rounded-md text-gray-200 text-center text-xl px-4 bg-gray-700">{feature.name}</div>

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
                    <div className="p-2 rounded-md bg-gray-700 text-lg">{feature.dueDate || 'Not set'}</div>
                </div>
            </div>

            <div className="text-xl mt-4">Git Branch:</div>
            <div className="flex items-center h-12 rounded-md font-mono text-gray-100 text-lg px-4 bg-gray-700">{feature.gitBranch}</div>

            <div className="text-xl mt-4">Description:</div>
            <div className="h-1/4 whitespace-pre-wrap bg-gray-700 p-4 text-xl rounded-md scroller-slim">
                {feature.description || 'No description provided.'}
            </div>

            <div className="text-xl mt-4">Acceptance Criteria:</div>
            <div className="h-1/4 whitespace-pre-wrap bg-gray-700 p-4 text-xl rounded-md scroller-slim">
                {feature.acceptanceCriteria || 'No acceptance criteria provided.'}
            </div>
        </div>
    );
}
