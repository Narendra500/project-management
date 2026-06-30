import { usePopUpContext } from "#contexts/PopUpContext";
import { TREE_NODE_BACKGROUND_COLORS } from "#utils/tree";
import { getButtonWithColor } from "#components/forms/TreeForms";
import { updateCategoryDetails } from "#services/categoryServices";
import { useState } from "react";

export default function CategoryDetails() {
    const categoryDetails = usePopUpContext();
    const [editMode, setEditMode] = useState(false);
    const [input, setInput] = useState({
        name: categoryDetails?.name || "",
        description: categoryDetails?.description || "",
        color: categoryDetails?.color || "white",
        colorMode: "normal"
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

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

    const handleSave = async () => {
        setError(null);
        setSuccess(null);
        const response = await updateCategoryDetails(categoryDetails.projectUuid, categoryDetails.uuid, input.name, input.description, input.color, input.colorMode);
        if (response.success) {
            // Update the local version of the category context in case the user wants to edit again.   
            const data = response.data;
            categoryDetails.name = data.name;
            categoryDetails.description = data.description;
            categoryDetails.color = data.color;

            setSuccess(response.message);
            setEditMode(false);
        } else {
            setError(response.message);
        }
    };

    const cancelEditMode = () => {
        // Revert input values to original state
        setInput({
            name: categoryDetails?.name || "",
            description: categoryDetails?.description || "",
            color: categoryDetails?.color || "white",
            colorMode: "normal"
        });
        setError(null);
        setSuccess(null);
        setEditMode(false);
    }

    return (
        <div className="h-[86%] w-10/12 relative">
            <div className="text-red-300 mt-2 text-center">{error}</div>
            <div className="text-green-300 mt-2 text-center">{success}</div>

            {/* Header with Edit/Save Toggle */}
            <div className="flex items-center mb-4">
                <div className="text-2xl font-bold">Category Details</div>
                <div className="grow flex justify-end">
                    <button
                        onClick={editMode ? handleSave : () => setEditMode(true)}
                        className="button-update"
                    >
                        {editMode ? "Save" : "Edit"}
                    </button>
                    {
                        editMode && <button
                            onClick={cancelEditMode}
                            className="button-cancel ml-6 px-4 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                        >
                            {"cancel"}
                        </button>
                    }
                </div>
            </div>

            {
                editMode ?
                    <div className="scroller-slim h-[80%]">
                        <CategoryFormContent
                            editMode={editMode}
                            input={input}
                            handleInput={handleInput}
                            handleColorChange={handleColorChange}
                        />
                    </div> :
                    <CategoryFormContent
                        editMode={editMode}
                        input={input}
                        handleInput={handleInput}
                        handleColorChange={handleColorChange}
                        categoryDetails={categoryDetails}
                    />
            }
        </div >
    );
}

export function CategoryFormContent({ editMode, input, categoryDetails, handleInput, handleColorChange }) {
    return (
        <>
            {/* Category Name Section */}
            <div className="text-xl text-gray-300 mb-1">Category name:</div>
            {editMode ? (
                <input
                    type="text"
                    name="name"
                    value={input.name}
                    onChange={handleInput}
                    className="w-full h-16 rounded-md text-gray-200 text-2xl text-center bg-gray-600 outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    placeholder="Enter category name"
                />
            ) : (
                <div className="flex flex-col justify-center h-16 rounded-md text-gray-200 text-2xl text-center bg-gray-700 mb-4">
                    {categoryDetails.name}
                </div>
            )}

            {/* Category Description Section */}
            <div className="text-xl text-gray-300 mb-1">Category description:</div>
            {editMode ? (
                <textarea
                    name="description"
                    value={input.description}
                    onChange={handleInput}
                    className="w-full h-[75%] resize-none bg-gray-600 p-4 text-xl text-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 scroller-slim"
                    placeholder="Enter category description..."
                />
            ) : (
                <div className="h-[65%] whitespace-pre-wrap mb-6 bg-gray-700 p-4 text-xl text-gray-200 rounded-md scroller-slim">
                    {categoryDetails.description || "Category description not provided"}
                </div>
            )}

            {/* Category Color Section */}
            {editMode && (
                <div className="w-full md:w-[90%] mb-8">
                    <p className="font-bold mb-2">Category Color:</p>
                    <div className="h-fit flex flex-row flex-wrap justify-evenly mt-4 mb-8">
                        {Object.entries(TREE_NODE_BACKGROUND_COLORS).map(([name, button_color]) =>
                            getButtonWithColor(name, button_color, input.color === name, handleColorChange)
                        )}
                    </div>

                    <p className="font-bold mb-2">Color Propagation Mode:</p>
                    <div className="flex flex-col gap-2 mt-2 mb-8">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                            <input
                                type="radio"
                                name="colorMode"
                                value="normal"
                                checked={input.colorMode === "normal"}
                                onChange={handleInput}
                                className="cursor-pointer accent-purple-500 w-5 h-5"
                            />
                            <span>Normal (Change color of only the sub-categories with same color)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                            <input
                                type="radio"
                                name="colorMode"
                                value="force"
                                checked={input.colorMode === "force"}
                                onChange={handleInput}
                                className="cursor-pointer accent-purple-500 w-5 h-5"
                            />
                            <span>Force (Change color of all sub-categories)</span>
                        </label>
                    </div>
                </div>
            )}
        </>
    );
}
