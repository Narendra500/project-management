import { updateLocalStorageTreeExpansionState } from "./treeExpansionStateHelper";

export const TREE_UPDATE_TYPES = Object.freeze({
    ADD_CATEGORY: "add_category",
    UPDATE_CATEGORY: "update_category",
    DELETE_CATEGORY: "delete_category",
    ADD_FEATURE: "add_feature",
    UPDATE_FEATURE: "update_feature",
    DELETE_FEATURE: "delete_feature",
});

export const TREE_NODE_TYPES = Object.freeze({
    projectNode: "projectNode",
    categoryNode: "categoryNode",
    featureNode: "featureNode",
});

export const TREE_NODE_EXPANSION_STATES = Object.freeze({
    expanded: "expanded",
    folded: "folded",
});

export class TreeNode {
    constructor(uuid, name, parentNode, upperLayerParNode, treeNodeExpansionState, treeNodeType, color, treeNodeStatus) {
        this.uuid = uuid;
        this.name = name;
        this.parentNode = parentNode;
        this.upperLayerParNode = upperLayerParNode;
        this.expansionState = treeNodeExpansionState;
        this.status = treeNodeStatus;
        this.type = treeNodeType;
        this.color = color || "bg-white";
        this.children = [];
    }
}

export const TREE_NODE_BACKGROUND_COLORS = Object.freeze({
    blue: "bg-blue-700",
    red: "bg-red-700",
    white: "bg-white",
    green: "bg-green-700",
    yellow: "bg-yellow-500",
    pink: "bg-pink-700",
    purple: "bg-purple-700",
});

export const TREE_NODE_TEXT_COLORS = Object.freeze({
    blue: "text-blue-700",
    red: "text-red-700",
    white: "text-white",
    green: "text-green-700",
    yellow: "text-yellow-500",
    pink: "text-pink-700",
    purple: "text-purple-700",
});

function createLocalExpansionStateTree(projectData) {
    let projectExpansionStateString = localStorage.getItem(`project-${projectData.uuid}-expansionState`);
    if (!projectExpansionStateString) {
        const tempProjectExpansionStateJson = {};
        for (const category of projectData.categories) {
            tempProjectExpansionStateJson[category.uuid] = {};
            tempProjectExpansionStateJson[category.uuid].expansionState = TREE_NODE_EXPANSION_STATES.folded;
            for (const feature of category.features) {
                tempProjectExpansionStateJson[category.uuid].features = {};
                tempProjectExpansionStateJson[category.uuid].features[feature.uuid] = TREE_NODE_EXPANSION_STATES.folded;
            }
        }
        const tempProjectExpansionStateString = JSON.stringify(tempProjectExpansionStateJson);
        setProjectExpansionState(projectData.uuid, tempProjectExpansionStateString);
    }
}

function setProjectExpansionState(projectUuid, projectExpansionStateString) {
    localStorage.setItem(`project-${projectUuid}-expansionState`, projectExpansionStateString);
}

function getProjectExpansionState(projectUuid) {
    return localStorage.getItem(`project-${projectUuid}-expansionState`);
}

export function convertToTree(projectData, filter, userId) {
    if (!projectData) return null;

    // map to access nodes by id
    const map = new Map();

    // For shared projects the new user won't have the state saved locally on their machines.
    createLocalExpansionStateTree(projectData);
    const projectExpansionStateString = getProjectExpansionState(projectData.uuid);

    const projectExpansionStateJson = JSON.parse(projectExpansionStateString);
    // root node
    const projectNode = {
        uuid: projectData.uuid,
        name: projectData.name,
        roles: projectData.projectRoles,
        description: projectData.description,
        users: projectData.users,
        parentNode: projectData.parentNode,
        upperLayerParNode: projectData.upperLayerParNode,
        type: TREE_NODE_TYPES.projectNode,
        color: projectData.color || "bg-white",
        children: [],
    };
    map.set(projectData.uuid, projectNode);

    // create node and map them for each category of the project and each feature of a category.
    for (const category of projectData.categories) {
        const categoryNode = new TreeNode(
            category.uuid,
            category.name,
            category.parentUuid,
            projectData.uuid,
            projectExpansionStateJson[category.uuid].expansionState || TREE_NODE_EXPANSION_STATES.expanded,
            TREE_NODE_TYPES.categoryNode,
            category.color,
        );
        map.set(category.uuid, categoryNode);

        // create feature nodes of the created category and map them
        for (const feature of category.features) {
            if (
                (filter === "assigned-to-me" && feature.details.assigneeId === userId) ||
                filter === "noFilter" ||
                feature.details.status === filter
            ) {
                const featureNode = new TreeNode(
                    feature.uuid,
                    feature.name,
                    feature.parentUuid,
                    category.uuid,
                    projectExpansionStateJson[category.uuid].features[feature.uuid] || TREE_NODE_EXPANSION_STATES.expanded,
                    TREE_NODE_TYPES.featureNode,
                    feature.parentNode?.color || category.color,
                    feature.details.status,
                );
                map.set(feature.uuid, featureNode);
            }
        }
    }

    // connect all nodes to their respective parent nodes
    for (const category of projectData.categories) {
        const categoryNode = map.get(category.uuid);

        // if not parentUuid for category then its a top level category, therefore the child of the projectNode
        if (category.parentUuid === null) projectNode.children.push(categoryNode);
        // get categories parent node and push the current node to its children array
        else {
            map.get(category.parentUuid).children.push(categoryNode);
        }

        // connect all features of the current category to their parent feature/category
        for (const feature of category.features) {
            if (
                (filter === "assigned-to-me" && feature.details.assigneeId === userId) ||
                filter === "noFilter" ||
                feature.details.status === filter
            ) {
                const featureNode = map.get(feature.uuid);
                // no parentUuid , current category is the parent
                if (feature.parentUuid === null) {
                    categoryNode.children.push(featureNode);
                } else if (map.get(feature.parentUuid)) {
                    map.get(feature.parentUuid).children.push(featureNode);
                }
            }
        }
    }

    if (filter !== "noFilter") {
        pruneEmptyNodes(projectNode);
    }

    return { projectNode, map };
}

function pruneEmptyNodes(node) {
    // Recursively filter children first (bottom-up approach)
    if (node.children && node.children.length > 0) {
        node.children = node.children.filter((child) => pruneEmptyNodes(child));
    }

    // Always keep the Project Node
    if (node.type === TREE_NODE_TYPES.projectNode) return true;

    // Always keep Feature Nodes (because they already passed the status filter in the loop above)
    if (node.type === TREE_NODE_TYPES.featureNode) return true;

    // Only keep Category Nodes if they still have children after the recursive filter
    if (node.type === TREE_NODE_TYPES.categoryNode) {
        return node.children.length > 0;
    }

    return false;
}

export function updateTree(updateType, treeData, setTreeData, data) {
    if (treeData.projectNode.uuid === data.projectUuid) {
        const projectMap = treeData.map;
        // Default values
        let childNode = null;

        switch (updateType) {
            case TREE_UPDATE_TYPES.ADD_CATEGORY:
                if (projectMap.get(data.categoryUuid)) {
                    return;
                }

                childNode = new TreeNode(
                    data.categoryUuid,
                    data.categoryName,
                    data.categoryParentUuid,
                    data.projectUuid,
                    TREE_NODE_EXPANSION_STATES.expanded,
                    TREE_NODE_TYPES.categoryNode,
                    data.categoryColor,
                );
                break;
            case TREE_UPDATE_TYPES.ADD_FEATURE:
                if (projectMap.get(data.featureUuid)) {
                    return;
                }

                childNode = new TreeNode(
                    data.featureUuid,
                    data.featureName,
                    data.featureParentUuid,
                    data.categoryUuid,
                    TREE_NODE_EXPANSION_STATES.expanded,
                    TREE_NODE_TYPES.featureNode,
                    "", // feature color is derived from category color, don't need to store separately
                    "open", // status
                );
                break;
            case TREE_UPDATE_TYPES.UPDATE_CATEGORY:
                if (!projectMap.get(data.categoryUuid)) {
                    return;
                }
                const node = projectMap.get(data.categoryUuid);
                node.name = data.categoryName;
                node.color = data.categoryColor;

                if (data.updatedSubCategoryUuids && Array.isArray(data.updatedSubCategoryUuids)) {
                    data.updatedSubCategoryUuids.forEach((uuid) => {
                        const subNode = projectMap.get(uuid);
                        if (subNode) {
                            subNode.color = data.categoryColor;
                        }
                    });
                }
                break;
        }

        if (isAddOrDeleteUpdate(updateType)) {
            updateLocalStorageTreeExpansionState(updateType, data);
            if (!childNode.parentNode) {
                projectMap.get(childNode.upperLayerParNode).children.push(childNode);
            } else {
                projectMap.get(childNode.parentNode).children.push(childNode);
            }
            projectMap.set(childNode.uuid, childNode);
        }

        // Changes root node so that react rerenders the TreeViewComponent.
        const temp = { ...treeData };
        setTreeData(temp);
    }
}

function isAddOrDeleteUpdate(updateType) {
    return updateType === TREE_UPDATE_TYPES.ADD_CATEGORY || updateType === TREE_UPDATE_TYPES.ADD_FEATURE;
}

function isModifyUpdate(updateType) {
    return updateType === TREE_UPDATE_TYPES.UPDATE_CATEGORY || updateType === TREE_UPDATE_TYPES.UPDATE_FEATURE;
}
