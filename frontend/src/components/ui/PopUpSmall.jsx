import NavButton from "#components/ui/NavButton";
import { useNavigate } from "react-router";

export function PopUpSmall({ children }) {
    const navigate = useNavigate();
    return (
        <div className="absolute flex flex-col items-center h-5/12 w-full lg:w-7/12 xl:w-6/12 rounded-2xl border-2 border-purple-300 bg-gray-800 lg:translate-x-[40%] xl:translate-x-[50%] translate-y-[50%]">
            <button type="button" className="button-no-border mt-[8px] mr-[8px] w-[30px] self-end" onClick={() => navigate(-1)}>X</button>
            {children}
        </div>
    );
}
