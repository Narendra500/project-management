import { usePopUpContext } from "#contexts/PopUpContext";

export default function CategoryDetails() {
    const categoryDetails = usePopUpContext();

    return (
        <div className="h-[86%] w-10/12">
            <div className="text-xl text-gray-300">Category name:</div>
            <div className="flex flex-col justify-center h-16 rounded-md text-gray-200 text-2xl text-center bg-gray-700">{categoryDetails.name}</div>
            <div className="text-xl mt-4 text-gray-300">Category description:</div>
            <div className="h-[80%] whitespace-pre-wrap mb-6 bg-gray-700 p-4 text-xl text-gray-200 rounded-md scroller-slim">
                {categoryDetails.description || "Category description not provided"}
            </div>
        </div>
    );
}
