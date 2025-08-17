import * as authServices from "#services/authServices";
import * as profileServices from "#services/profileServices";
import { Form, Link, useLocation, useOutletContext, useNavigate } from "react-router";
import { useState } from "react";
import getProjectName from "#constants/projectName";
import * as projectServices from "#services/projectServices"
import Input from "#components/ui/Input";
import TextArea from "#components/ui/TextArea";
import NavButton from "#components/ui/NavButton";
import { useAppContext } from "../contexts/AppContext";


export function AuthForm() {
    const [input, setInput] = useOutletContext().input;
    const [error, setError] = useOutletContext().error;
    const [isPasswordVisible, setPasswordVisibility] = useState(false);

    // useLocation gives the path /auth/login or /auth/register split at / we get 3 strings "", "auth", "login" | "register", accessing 2nd index
    // we get the current authState i.e login or register
    const authState = useLocation().pathname.split("/")[2];
    const navigate = useNavigate();

    function clearError() {
        setError(null);
    }

    function validateUsername(username = input.username) {
        if (/\s/.test(username)) return "Username must not contain spaces.";
        if (username.length < 8 || username.length > 128) return "Username must be atleast 8 and atmost 128 characters long";
        return null;
    }

    function validatePassword(password = input.password) {
        if (/\s/.test(password)) {
            return "Password must not contain spaces.";
        }
        if (password.length < 8 || password.length > 72) {
            return "Password must be at least 8 and atmost 72 characters long.";
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) {
            return "Password must include an uppercase letter, a lowercase letter, a number, and a special symbol (!@#$%^&*).";
        }

        // all constraints satisfied
        return null;
    }

    const handleSubmitEvent = async (e) => {
        e.preventDefault();
        const usernameError = validateUsername();
        const passwordError = validatePassword();

        if (usernameError || passwordError) {
            setError(usernameError || passwordError);
            return;
        } else clearError();

        const response = await (authState === "login"
            ? authServices.login(input.username, input.password, input.rememberMe)
            : authServices.register(input.username, input.password, input.rememberMe));

        if (response.success) {
            navigate("/");
        } else {
            setError(response.message);
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisibility(isPasswordVisible ? false : true);
    };

    const handleInput = (e) => {
        const name = e.target.name;
        // checkbox status is found in the field checked, while its in the field value for other inputs like text or password.
        const value = e.target.name === 'rememberMe' ? e.target.checked : e.target.value;
        setInput((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="flex w-full flex-col items-center justify-center px-3 py-10 md:px-6 xl:w-1/2">
            <h1 className="mb-[10%] w-full text-center text-5xl break-words text-white">
                {authState === "login" ? `Login to ${getProjectName()}` : "Create an account"}
            </h1>

            {/* display error if any */}
            <div className="text-md mb-2 w-full text-center font-mono text-red-700 md:w-10/12">{error ? error : ""}</div>
            <Form onSubmit={handleSubmitEvent} className="flex w-full flex-col items-center">
                <Input
                    type={"text"}
                    id={"username"}
                    name={"username"}
                    placeholder={"Username"}
                    onChange={handleInput}
                    isRequired={true}
                />
                <Input
                    type={isPasswordVisible ? "text" : "password"}
                    id={"user-password"}
                    name={"password"}
                    placeholder={"Password"}
                    onChange={handleInput}
                    isRequired={true}
                />
                {/* toggles the visibility of the password, i.e., hide or show */}
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="mr-[5%] -translate-y-14 self-end opacity-60 hover:cursor-pointer md:mr-[11%]"
                >
                    {isPasswordVisible ? "HIDE" : "SHOW"}
                </button>
                {/* remember me checkbox */}
                <div className="ml-auto mr-24">
                    <input type="checkbox" name="rememberMe" onClick={handleInput} className="w-5 h-5 mr-2" />
                    <label htmlFor="rememberMe" className="text-xl">Remember me</label>
                </div>
                {/* login or create acccount button depending on type of auth*/}
                <button
                    type="submit"
                    className="my-10 w-full cursor-pointer rounded-lg bg-purple-800 from-violet-500 to-fuchsia-500 py-4 text-xl font-bold hover:bg-gradient-to-bl md:w-10/12"
                >
                    {authState === "login" ? "Login" : "Create account"}
                </button>
            </Form>

            {/*link to change auth type*/}
            <div className="my-4 text-white">
                {authState === "login" ? "Don't" : "Already"} have an account?{" "}
                <Link
                    to={`/auth/${authState === "login" ? "register" : "login"}`}
                    className="cursor-pointer font-bold text-purple-500 underline hover:text-purple-400"
                    onClick={clearError}
                >
                    {authState === "login" ? "Register" : "Login"}
                </Link>
            </div>
        </div>
    );
}

export function ChangeDisplayNameForm() {
    const [input, setInput] = useState();
    const { setUser } = useAppContext();
    const [error, setError] = useOutletContext().error;

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
        <Form onSubmit={handleSubmit} className="flex h-full w-full flex-col items-center justify-center">
            <Input onChange={handleInput} placeholder={"New Display Name"} cssClasses="w-2/3" isRequired={true} />
            <NavButton type={"submit"} buttonText={"Confirm"} cssClasses="w-1/2 mt-10 px-6 py-3" />
        </Form>
    );
}


export function CreateUserProjectForm() {
    const [input, setInput] = useState({
        projectName: "",
        projectDescription: ""
    });
    const [projects, setProjects] = useOutletContext().projects;
    const navigate = useNavigate();

    const handleInput = (e) => {
        const { name, value } = e.target;
        setInput((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async () => {
        const response = await projectServices.createUserProject(input.projectName, input.projectDescription);
        projects.push(response.data);
        setProjects(projects);

        navigate("/project/user/me");
    };

    return (
        <Form onSubmit={handleSubmit} className="flex w-full h-full flex-col items-center justify-center">
            <Input name="projectName" onChange={handleInput} placeholder="Project name" isRequired={true} />
            <TextArea name="projectDescription" onChange={handleInput} placeholder="Project description" cssClasses="h-8/12" />
            <NavButton type={"submit"} buttonText={"Confirm"} extraClasses="w-8/12" />
        </Form >
    );
}
