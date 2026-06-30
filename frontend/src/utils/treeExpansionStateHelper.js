import { TREE_UPDATE_TYPES } from "./tree";

export function updateLocalStorageTreeExpansionState(updateType, data) {
    projectExpansionStateString = localStorage.getItem(`project-${data.projectUuid}-expansionState`);
    projectExpansionStateJson = JSON.parse(projectExpansionStateString);

    switch (updateType) {
        case TREE_UPDATE_TYPES.ADD_CATEGORY:
            projectExpansionStateJson[data.categoryUuid] = {
                expansionState: TREE_NODE_EXPANSION_STATES.expanded,
                features: {},
            };
            break;
        case TREE_UPDATE_TYPES.ADD_FEATURE:
            projectExpansionStateJson[data.categoryUuid].features[data.featureUuid] = TREE_NODE_EXPANSION_STATES.expanded;
            break;
    }

    localStorage.setItem(`project-${data.projectUuid}-expansionState`, JSON.stringify(projectExpansionStateJson));
}
