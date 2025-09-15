export default function LongInput({ id, name, placeholder, onChange, isRequired, cssClasses }) {
    return (
        <textarea
            id={id}
            name={name}
            placeholder={placeholder}
            className={`h-5/12 mb-5 w-[96%] rounded bg-gray-700 p-3 font-mono md:w-[90%] scroller-slim resize-none ${cssClasses}`}
            onChange={onChange}
            required={isRequired}
        />
    );
}
