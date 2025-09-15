export default function ActionButton(props) {
    return (
        <button
            type={props.type}
            onClick={props.action}
            className={`flex items-center h-16 justify-center border-2 border-purple-500 px-4 py-2 mt-4 md:px-8 md:py-4 
                        text-lg font-bold rounded-full hover:cursor-pointer hover:bg-gradient-to-r 
                        from-purple-600 via-purple-500 to-red-400` + " " + props.extraClasses}
        >
            {props.buttonText}
        </button>
    );
};
