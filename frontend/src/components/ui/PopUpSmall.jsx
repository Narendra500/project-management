import NavButton from "#components/ui/NavButton";

export function PopUpSmall({ children }) {
    return (
        <div className="absolute flex flex-col items-center h-5/12 w-full lg:w-7/12 xl:w-6/12 rounded-2xl border-2 border-purple-300 bg-gray-800 lg:translate-x-[40%] xl:translate-x-[50%] translate-y-[50%]">
            <NavButton type="button" navigateTo={-1} buttonText="X" extraClasses="mt-[8px] mr-[8px] w-[30px] self-end" />
            {children}
        </div>
    );
}
