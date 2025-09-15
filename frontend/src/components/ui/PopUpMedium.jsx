import NavButton from "#components/ui/NavButton";
import PopUpContext from "#contexts/PopUpContext";
import { useLoaderData } from "react-router";

export function PopUpMedium({ children }) {
    const context = useLoaderData();

    return (
        <PopUpContext.Provider value={context}>
            <div className="100 absolute flex flex-col items-center h-11/12 w-full lg:w-10/12 xl:w-7/12 lg:translate-x-[10%] xl:translate-x-[35%] rounded-none md:rounded-2xl border-0 md:border-2 border-purple-300 bg-gray-800">
                <NavButton type="button" navigateTo={-1} buttonText="X" extraClasses="mt-[8px] mr-[8px] w-[30px] self-end" />
                {children}
            </div>
        </PopUpContext.Provider>
    );
}
