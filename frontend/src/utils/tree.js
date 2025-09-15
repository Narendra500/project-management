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
    constructor(id, name, parentNode, upperLayerParNode, treeNodeExpansionState, treeNodeType, color) {
        this.id = id;
        this.name = name;
        this.parentNode = parentNode;
        this.upperLayerParNode = upperLayerParNode;
        this.expansionState = treeNodeExpansionState;
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

export function convertToTree(projectData) {
    // map to access nodes by id
    if (!projectData) return null;

    const map = new Map();
    const projectExpansionStateString = localStorage.getItem(`project-${projectData.id}-expansionState`);
    const projectExpansionStateJson = JSON.parse(projectExpansionStateString);
    // root node
    const projectNode = new TreeNode(
        projectData.id,
        projectData.name,
        null,
        null,
        TREE_NODE_EXPANSION_STATES.expanded,
        TREE_NODE_TYPES.projectNode,
    );
    map.set("projectNode", projectNode);

    // create node and map them for each category of the project and each feature of a category.
    for (const category of projectData.categories) {
        // create category node and map it's id with prefix 'c-' as the ids are unique within a table not across tables, so feature and category may have
        // same id
        const categoryNode = new TreeNode(
            category.id,
            category.name,
            category.parentId,
            projectData.id,
            projectExpansionStateJson[category.id].expansionState || TREE_NODE_EXPANSION_STATES.expanded,
            TREE_NODE_TYPES.categoryNode,
            category.color,
        );
        map.set(`c-${category.id}`, categoryNode);

        // create feature nodes of the created category and map them with prefic 'f-'
        for (const feature of category.features) {
            const featureNode = new TreeNode(
                feature.id,
                feature.name,
                feature.parentId,
                category.id,
                projectExpansionStateJson[category.id].features[feature.id] || TREE_NODE_EXPANSION_STATES.expanded,
                TREE_NODE_TYPES.featureNode,
                category.color,
            );
            map.set(`f-${feature.id}`, featureNode);
        }
    }

    // connect all nodes to their respective parent nodes
    for (const category of projectData.categories) {
        const categoryNode = map.get(`c-${category.id}`);

        // if not parentId for category then its a top level category, therefore the child of the projectNode
        if (category.parentId === null) projectNode.children.push(categoryNode);
        // get categories parent node and push the current node to its children array
        else {
            const parent = `c-${category.parentId}`;
            map.get(parent).children.push(categoryNode);
        }

        // connect all features of the current category to their parent feature/category
        for (const feature of category.features) {
            const featureNode = map.get(`f-${feature.id}`);
            // no parentId , current category is the parent
            if (feature.parentId === null) categoryNode.children.push(featureNode);
            else map.get(`f-${feature.parentId}`).children.push(featureNode);
        }
    }

    return { projectNode, map };
}
