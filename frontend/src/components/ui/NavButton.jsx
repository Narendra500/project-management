import { Link, useNavigate } from "react-router";

export default function NavButton(props) {
    const navigate = useNavigate();

    return (
        <button
            type={props.type}
            onClick={() => navigate(props.navigateTo)}
            className={`flex items-center h-10 sm:h-16 justify-center border-2 border-purple-500 px-6 py-2 sm:px-8 sm:py-4 
                        text-sm lg:text-lg font-bold rounded-full hover:cursor-pointer hover:bg-gradient-to-r 
                        from-purple-600 via-purple-500 to-red-400` + " " + props.extraClasses}
        >
            {props.buttonText}
        </button>
    );
};
