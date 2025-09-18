import ActionButton from "#components/ui/ActionButton";
import Input from "#components/ui/Input";
import { useState } from "react";
import { useTreeContext } from "#contexts/TreeContext";
import { createCategory } from "#services/categoryServices";
import { createFeature } from "#services/featureServices";
import { useParams, Form, useNavigate } from "react-router";
import { TreeNode, TREE_NODE_BACKGROUND_COLORS, TREE_NODE_TYPES, TREE_NODE_EXPANSION_STATES } from "#utils/tree";
import LongInput from "#components/ui/LongInput";
import { usePopUpContext } from "#contexts/PopUpContext";

function getButtonWithColor(name, color, isSelected, handleColorChange) {
    return (
        <button key={color} type="button" className={`transition-transform delay-100 mx-2 md:mx-4 mt-2 h-12 w-20 ${color} rounded-md hover:cursor-pointer border-3 ${isSelected ? color === "bg-white" ? "border-blue-500 -translate-y-1" : "border-white -translate-y-1" : "border-gray-800"}`} onClick={() => handleColorChange(name)}>
        </button>
    )
}

export function CreateCategory() {
    const navigate = useNavigate();

    const params = useParams();
    const parNodeIdWithType = params.nodeId;
    const parNodeId = parNodeIdWithType.split("-")[1];
    const parNodeType = parNodeIdWithType.split("-")[0];
    const projectId = params.projectId;

    const [treeData, setTreeData] = useTreeContext();

    const parNode = parNodeType === 'c' ? treeData.map.get(`c-${parNodeId}`) : treeData.map.get("projectNode");
    const [input, setInput] = useState({
        name: "",
        description: "",
        color: "white",
    })

    const handleInput = (e) => {
        const field = e.target.name;
        const value = e.target.value;
        setInput((prev) => ({
            ...prev,
            [field]: value
        }))
    }

    const handleColorChange = (color) => {
        setInput((prev) => ({
            ...prev,
            color: color
        }))
    }

    const handleSubmit = async () => {
        const response = await createCategory(projectId, input.name, input.description, input.color, parNodeId === projectId ? null : parNodeId);
        if (response.success) {
            const parNode = parNodeType === "c" ? treeData.map.get(`c-${parNodeId}`) : treeData.map.get("projectNode");
            const projectExpansionStateString = localStorage.getItem(`project-${projectId}-expansionState`);
            const projectExpansionStateJson = JSON.parse(projectExpansionStateString);

            projectExpansionStateJson[response.data.categoryId] = {
                expansionState: TREE_NODE_EXPANSION_STATES.expanded,
                features: {}
            };
            localStorage.setItem(`project-${projectId}-expansionState`, JSON.stringify(projectExpansionStateJson));

            const childNode = new TreeNode(
                response.data.categoryId,
                response.data.categoryName,
                parNodeId,
                projectId,
                TREE_NODE_EXPANSION_STATES.expanded,
                TREE_NODE_TYPES.categoryNode,
                input.color
            );
            parNode.children.push(childNode);
            treeData.map.set(`c-${childNode.id}`, childNode);

            const temp = { ...treeData };
            setTreeData(temp);
            navigate(`/tree-view/${projectId}`);
        }
    }

    return (
        <Form onSubmit={handleSubmit} className="h-full w-full flex flex-col scroller-slim justify-evenly items-center">

            {/* heading */}
            <div className="h-fit text-2xl px-12 text-center text-gray-300">Add new
                {
                    parNodeType === "p" ?
                        " category " :
                        <select id="formType" value="categoryForm"
                            className="mx-2 pr-4 border-2 border-purple-200 rounded-md bg-gray-800 text-white hover:cursor-pointer"
                            onChange={() => { navigate(`/tree-view/${projectId}/node/${parNodeIdWithType}/add-new-feature`, { replace: true }) }}
                        >
                            <option key="categoryForm" value="categoryForm">sub-category</option>
                            <option key="featureForm" value="featureForm">feature</option>
                        </select>
                }
                <div>
                    to
                    {
                        parNodeType === 'c' ?
                            " category " :
                            " project "
                    }
                    <span className={`text-${parNode.color}-600`}>{parNode.name}</span>
                </div>
            </div>

            <div className="h-full mt-8 w-full pl-4 pb-8 sm:pl-7 md:pl-[9%]">
                {/* inputs */}
                <Input type="text" name="name" placeholder="Category Name" onChange={handleInput} isRequired={true} />
                <LongInput type="text" name="description" placeholder="Category Description" onChange={handleInput} />
                <div className="w-full md:w-[90%]">
                    <p className="font-bold">Category Color:</p>
                    <div className="h-fit flex flex-row flex-wrap justify-evenly mt-4 mb-16">
                        {Object.entries(TREE_NODE_BACKGROUND_COLORS).map(([name, color]) => getButtonWithColor(name, color, input.color === name, handleColorChange))}
                    </div>
                </div>

                {/* submit */}
                <button type="submit" className="button text-xl md:-translate-x-12 w-80 h-10 mx-auto">Submit</button>
            </div>
        </Form>
    );
}

export function CreateFeature() {
    const navigate = useNavigate();
    const projectUsers = usePopUpContext();

    const params = useParams();
    const projectId = params.projectId;
    const parNodeIdWithType = params.nodeId;
    const parNodeType = parNodeIdWithType.split('-')[0];
    const parNodeId = parNodeIdWithType.split('-')[1];

    const [treeData, setTreeData] = useTreeContext();

    // if parent node is category then get parent category name from map else get parent feature name
    const parNode = parNodeType === 'c' ? treeData.map.get(`c-${parNodeId}`) : treeData.map.get(`f-${parNodeId}`);
    const categoryId = parNodeType === 'c' ? parNodeId : treeData.map.get(parNodeIdWithType).upperLayerParNode;

    const [input, setInput] = useState({
        name: "",
        gitBranch: "",
        assignee: "",
        dueDate: "",
        description: "",
        acceptanceCriteria: ""
    })

    const handleInput = (e) => {
        const field = e.target.name;
        const value = e.target.value;
        setInput((prev) => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async () => {
        let dueDateISO8601Format = "";
        if (input.dueDate) {
            dueDateISO8601Format = new Date(input.dueDate).toISOString();
        }
        const response = await createFeature(
            input.name,
            input.gitBranch,
            input.assignee,
            dueDateISO8601Format,
            input.description,
            input.acceptanceCriteria,
            parNodeId === categoryId ? null : parNodeId,
            categoryId
        );

        if (response.success) {
            const parNode = treeData.map.get(parNodeIdWithType);

            const projectExpansionStateString = localStorage.getItem(`project-${projectId}-expansionState`);
            const projectExpansionStateJson = JSON.parse(projectExpansionStateString);

            projectExpansionStateJson[categoryId].features[response.data.featureId] = TREE_NODE_EXPANSION_STATES.expanded;

            localStorage.setItem(`project-${projectId}-expansionState`, JSON.stringify(projectExpansionStateJson));

            const createdNode = new TreeNode(
                response.data.featureId,
                response.data.featureName,
                parNodeId,
                categoryId,
                TREE_NODE_EXPANSION_STATES.expanded,
                TREE_NODE_TYPES.featureNode,
                "" // feature color is derived from category color, don't need to store separately
            );

            parNode.children.push(createdNode);

            const temp = { ...treeData };
            setTreeData(temp);
            navigate(`/tree-view/${projectId}`);
        }
    }

    return (
        <Form onSubmit={handleSubmit} className="h-full w-full flex flex-col items-center">

            {/* heading */}
            <div className="h-[10%] text-2xl px-20 text-center text-gray-300">
                Add new
                {
                    parNodeType === "f" ?
                        " sub-feature " :
                        <select id="formType" className="mx-2 border-2 border-purple-200 rounded-md bg-gray-800 text-white hover:cursor-pointer"
                            onChange={() => { navigate(`/tree-view/${projectId}/node/${parNodeIdWithType}/add-new-category`, { replace: true }) }} value="featureForm"
                        >
                            <option key="featureForm" value="featureForm">
                                feature
                            </option>
                            <option key="categoryForm" value="categoryForm">
                                category
                            </option>
                        </select>
                }
                <div>
                    to {parNodeType === 'c' ? "category" : "feature"} <span className={`text-${parNode.color}-600`}>{parNode.name}</span>
                </div>
            </div>

            <div className="h-[80%] mt-4 w-full scroller-slim pl-4 sm:pl-7 md:pl-[9%]">
                {/* inputs */}
                {/* name */}
                <label htmlFor="name" className="text-xl text-gray-400 block">Feature name:</label>
                <Input type="text" id="name" name="name" placeholder="(required)" onChange={handleInput} isRequired={true} />

                {/* git branch */}
                <label htmlFor="gitBranch" className="text-xl text-gray-400 block">Feature git-branch:</label>
                <Input type="text" id="gitBranch" name="gitBranch" placeholder="(required)" onChange={handleInput} isRequired={true} />

                {/* assigneeId */}
                <label htmlFor="assignee" className="text-xl text-gray-400 block">Feature assignee:</label>
                <select
                    id="assignee"
                    name="assignee"
                    value={input.assignee || ""}
                    onChange={handleInput}
                    className="block w-[96%] md:w-[90%] mb-4 p-3 rounded bg-gray-700 text-white"
                >
                    {/* Default, non-selectable option */}
                    <option value="" disabled>
                        Select an assignee
                    </option>

                    {/* Map over your projectUsers array to create an option for each user */}
                    {projectUsers.map(user => (
                        <option key={user.user_id} value={user.user_id}>
                            {user.display_name} ({user.role})
                        </option>
                    ))}
                </select>

                {/* due date */}
                <label htmlFor="dueDate" className="text-xl text-gray-400 block">Feature due date:</label>
                <input type="date" id="dueDate" name="dueDate" className="block mb-4 text-md self-baseline border-1 border-gray-500 rounded-sm p-1" onChange={handleInput} />

                {/* description */}
                < label htmlFor="description" className="text-xl text-gray-400 block">Feature description:</label>
                <LongInput type="text" id="description" name="description" placeholder="" onChange={handleInput} />

                {/* acceptance criteria */}
                <label htmlFor="acceptanceCriteria" className="text-xl text-gray-400 block">Feature acceptance-criteria:</label>
                <LongInput type="text" id="acceptanceCriteria" name="acceptanceCriteria" placeholder="" onChange={handleInput} />

                {/* submit */}
                <button type="submit" className="button md:-translate-x-12 text-xl w-80 h-10 mx-auto">Submit</button>
            </div>
        </Form >
    );
}
