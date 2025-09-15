export default function Input({ type, id, name, placeholder, onChange, isRequired, cssClasses }) {
    return (
        <input
            type={type}
            id={id}
            name={name}
            placeholder={placeholder}
            className={`mb-5 w-[96%] rounded bg-gray-700 p-3 font-mono md:w-[90%] ${cssClasses}`}
            onChange={onChange}
            required={isRequired}
        />
    );
}
