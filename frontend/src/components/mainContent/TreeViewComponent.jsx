import { getProjectData } from "#services/projectServices";
import { useLoaderData, Outlet, useNavigate, Link } from "react-router";
import { useState } from "react";
import TreeContext from "#contexts/TreeContext";
import { convertToTree, TREE_NODE_TYPES, TREE_NODE_TEXT_COLORS, TREE_NODE_EXPANSION_STATES } from "#utils/tree";

function TreeNodeComponent({ node, updateNode, navigate }) {
    return (
        <div className="font-mono">
            <Link to={`node/${node.uuid}/view-project-details`} className="text-xl hover:cursor-pointer hover:text-amber-100 inline-block">
                {node.name}
            </Link>
            <button onClick={() => { navigate(`node/${node.uuid}/add-new-category`) }}
                className="ml-4 font-bold text-gray-600 hover:text-gray-500 text-md border-1 px-2 pl-4 rounded-sm border-gray-800 hover:cursor-pointer hover:border-gray-500">Add</button>
            {node.children.map((child, index) => (
                <RecursiveNode
                    key={child.uuid}
                    node={child}
                    isLast={index === node.children.length - 1}
                    prefix=""
                    color={child.color}
                    updateNode={updateNode}
                    navigate={navigate}
                />
            ))}
        </div>
    );
}

function RecursiveNode({ node, isLast, prefix, color, updateNode, navigate }) {
    const connector = isLast ? '└' : '├';
    const line = '─';
    return (
        < div className="whitespace-pre-wrap" >
            <div className="inline-block text-4xl">{prefix}{connector}{line}</div>
            <Link
                to=
                {
                    node.type === TREE_NODE_TYPES.categoryNode ?
                        `node/${node.uuid}/view-category-details` :
                        `node/${node.upperLayerParNode}/${node.uuid}/view-feature-details`
                }
                className={`inline-block text-xl ${TREE_NODE_TEXT_COLORS[color]} hover:text-amber-100 hover:cursor-pointer`}
            >
                &nbsp;{node.name}{node.type === TREE_NODE_TYPES.categoryNode && "/"}
            </Link>

            {
                node.children.length > 0 &&
                <button onClick={() => (
                    updateNode(
                        node,
                        "expansionState",
                        node.expansionState === TREE_NODE_EXPANSION_STATES.expanded ?
                            TREE_NODE_EXPANSION_STATES.folded :
                            TREE_NODE_EXPANSION_STATES.expanded
                    )
                )}
                    className="ml-4 text-gray-300 text-md border-1 px-2 pl-4 rounded-sm border-gray-800 hover:cursor-pointer hover:border-gray-500">
                    {node.expansionState === TREE_NODE_EXPANSION_STATES.expanded ? "-" : "+"}
                </button>
            }
            <button onClick={() => navigate(`node/${node.uuid}/add-new-feature`)}
                className="ml-4 font-bold text-gray-600 hover:text-gray-500 text-md border-1 px-2 pl-4 rounded-sm border-gray-800 hover:cursor-pointer hover:border-gray-600">Add</button>
            {
                node.expansionState === TREE_NODE_EXPANSION_STATES.expanded &&
                node.children.map((child, index) => (
                    <RecursiveNode
                        key={child.uuid}
                        node={child}
                        isLast={index === node.children.length - 1}
                        prefix={prefix + (isLast ? '   ' : '│  ')}
                        color={child.type === TREE_NODE_TYPES.categoryNode ? child.color : node.color}
                        updateNode={updateNode}
                        navigate={navigate}
                    />
                ))
            }
        </div >
    );
}

export async function loader({ params }) {
    const projectUuid = params.projectUuid;
    if (projectUuid === "null") {
        return "";
    }
    const response = await getProjectData(projectUuid);
    return response.data.projectData;
}

export default function TreeViewComponent() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState(localStorage.getItem("projectFilter") || "noFilter");
    const projectTree = useLoaderData();
    const [treeData, setTreeData] = useState(convertToTree(projectTree, filter));

    function updateNode(node, field, value) {
        if (!node) return;
        node[field] = value;
        if (field === "expansionState") {
            const projectExpansionStateString = localStorage.getItem(`project-${treeData.projectNode.uuid}-expansionState`);
            const projectExpansionStateJson = JSON.parse(projectExpansionStateString);
            if (node.type === TREE_NODE_TYPES.categoryNode)
                projectExpansionStateJson[node.uuid].expansionState = value;
            else
                projectExpansionStateJson[node.upperLayerParNode].features[node.uuid] = value;
            localStorage.setItem(`project-${treeData.projectNode.uuid}-expansionState`, JSON.stringify(projectExpansionStateJson));
        }
        const temp = { ...treeData };
        setTreeData(temp);
    }

    if (treeData === null) return (
        <div className="h-full flex flex-col justify-center items-center">
            <div className="text-5xl">Looks like you haven't set any project as active yet!</div> <Link to="/project/user/me" className="mt-10 text-2xl text-purple-700 underline" replace>Click here to go to projects section</Link> </div>
    )

    function handleFilterChange(e) {
        localStorage.setItem("projectFilter", e.target.value);
        setFilter(e.target.value);
        console.log(filter);
        const temp = { ...treeData };
        setTreeData(temp);
    }

    return (
        <TreeContext.Provider value={[treeData, setTreeData]}>
            <Outlet />
            <div className="h-full scroller-x-slim scroller-slim bg-gray-950 text-gray-400 pl-6 py-6">
                <div className="flex justify-center">
                    <div className="text-2xl">Filter:</div>
                    <select className="ml-4 p-1 border-2 border-purple-200 rounded-md hover:cursor-pointer"
                        onChange={handleFilterChange}
                    >
                        <option className="bg-gray-800" value=""></option>
                        <option className="bg-gray-800" value="noFilter">No filter</option>
                        <option className="bg-gray-800" value="open">Open</option>
                        <option className="bg-gray-800" value="inWork">In work</option>
                        <option className="bg-gray-800" value="done">Done</option>
                    </select>
                </div>
                <TreeNodeComponent node={treeData.projectNode} updateNode={updateNode} navigate={navigate} />
            </div>
        </TreeContext.Provider >
    );
}
