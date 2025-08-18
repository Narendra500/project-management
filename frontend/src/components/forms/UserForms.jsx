import * as profileServices from "#services/profileServices";
import { Form, useNavigate } from "react-router";
import { useState } from "react";
import Input from "#components/ui/Input";
import NavButton from "#components/ui/NavButton";
import { useAppContext } from "#contexts/AppContext";

export function ChangeDisplayNameForm() {
    const [input, setInput] = useState();
    const { setUser } = useAppContext();
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (input.length > 64) {
            setError("Can't have username longer than 64 characters!");
            return;
        }

        const response = await profileServices.changeDisplayName(input);
        if (!response.success) {
            setError(response.message);
            return;
        }

        setError(null);

        setUser(prevUser => ({
            ...prevUser,
            displayName: response.data.displayName
        }))
        navigate("/profile/me");
    };

    const handleInput = (e) => {
        setInput(e.target.value);
    };

    return (
        <Form onSubmit={handleSubmit} className="flex flex-col items-center h-full w-full">
            <div className="text-red-300 mt-2 text-center">{error}</div>
            <Input onChange={handleInput} placeholder={"New Display Name"} cssClasses="w-2/3 py-6 mx-8 mt-10 mb-15 text-xl" isRequired={true} />
            <NavButton type={"submit"} buttonText={"Confirm"} cssClasses="w-1/2 px-6 py-3" />
        </Form>
    );
}
