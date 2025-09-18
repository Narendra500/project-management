import { getProjectData } from "#services/projectServices";
import { useLoaderData, Outlet, useNavigate, Link } from "react-router";
import { useState } from "react";
import TreeContext from "#contexts/TreeContext";
import { convertToTree, TREE_NODE_TYPES, TREE_NODE_TEXT_COLORS, TREE_NODE_EXPANSION_STATES } from "#utils/tree";

function TreeNodeComponent({ node, updateNode, navigate }) {
    return (
        <div className="font-mono">
            <div className="text-xl hover:cursor-default inline-block">{node.name}</div>
            <button onClick={() => { navigate(`node/p-${node.id}/add-new-category`) }}
                className="ml-4 font-bold text-gray-600 hover:text-gray-500 text-md border-1 px-2 pl-4 rounded-sm border-gray-800 hover:cursor-pointer hover:border-gray-500">Add</button>
            {node.children.map((child, index) => (
                <RecursiveNode
                    key={child.id}
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
            <Link to={node.type === TREE_NODE_TYPES.categoryNode ?
                `node/${node.id}/view-category-details` :
                `node/${node.upperLayerParNode}/${node.id}/view-feature-details`
            }
                className={`inline-block text-xl ${TREE_NODE_TEXT_COLORS[color]} hover:text-amber-100 hover:cursor-pointer`}>
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
            <button onClick={() => navigate(`node/${node.type === TREE_NODE_TYPES.categoryNode ? 'c' : 'f'}-${node.id}/add-new-feature`)}
                className="ml-4 font-bold text-gray-600 hover:text-gray-500 text-md border-1 px-2 pl-4 rounded-sm border-gray-800 hover:cursor-pointer hover:border-gray-600">Add</button>
            {
                node.expansionState === TREE_NODE_EXPANSION_STATES.expanded &&
                node.children.map((child, index) => (
                    <RecursiveNode
                        key={child.id}
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
    const projectId = params.projectId;
    if (projectId === "null") {
        return "";
    }
    const response = await getProjectData(projectId);
    return response.data.projectData;
}

export default function TreeViewComponent() {
    const navigate = useNavigate();
    const projectTree = useLoaderData();
    const [treeData, setTreeData] = useState(convertToTree(projectTree));

    function updateNode(node, field, value) {
        if (!node) return;
        node[field] = value;
        if (field === "expansionState") {
            const projectExpansionStateString = localStorage.getItem(`project-${treeData.projectNode.id}-expansionState`);
            const projectExpansionStateJson = JSON.parse(projectExpansionStateString);
            if (node.type === TREE_NODE_TYPES.categoryNode)
                projectExpansionStateJson[node.id].expansionState = value;
            else
                projectExpansionStateJson[node.upperLayerParNode].features[node.id] = value;
            localStorage.setItem(`project-${treeData.projectNode.id}-expansionState`, JSON.stringify(projectExpansionStateJson));
        }
        const temp = { ...treeData };
        setTreeData(temp);
    }

    if (treeData === null) return (
        <div className="h-full flex flex-col justify-center items-center">
            <div className="text-5xl">Looks like you haven't set any project as active yet!</div>
            <Link to="/project/user/me" className="mt-10 text-2xl text-purple-700 underline" replace>Click here to go to projects section</Link>
        </div>
    )

    return (
        <TreeContext.Provider value={[treeData, setTreeData]}>
            <Outlet />
            <div className="h-full scroller-x-slim scroller-slim bg-gray-950 text-gray-400 pl-6 py-6">
                <TreeNodeComponent node={treeData.projectNode} updateNode={updateNode} navigate={navigate} />
            </div>
        </TreeContext.Provider>
    );
}
