import NavButton from "#components/ui/NavButton";

export function PopUpMedium({ children }) {
    return (
        <div className="100 absolute flex flex-col items-center h-10/12 w-full lg:w-2/3 xl:w-1/2 lg:translate-x-[25%] xl:translate-x-[50%] rounded-2xl border-2 border-purple-300 bg-gray-800">
            <NavButton type="button" navigateTo={-1} buttonText="X" extraClasses="mt-[8px] mr-[8px] w-[30px] self-end" />
            {children}
        </div>
    );
}
