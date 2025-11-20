import { useState } from "react";
import authPhoto from "#assets/placeholderAuthImg.png";
import { Outlet, useLocation } from "react-router";

export default function AuthPage() {
    const location = useLocation();
    const isAuthForEmail = location.pathname.split("/")[2] === "get-email-verification-link";
    const isAuthForPasswordReset = location.pathname.split("/")[2] === "reset-password";
    const [error, setError] = useState(null);
    const [input, setInput] = useState({
        username: "",
        password: "",
        rememberMe: false,
    });

    if (isAuthForPasswordReset) {
        return (
            <Form onSubmit={handleResetPassword} className="flex w-full flex-col items-center">
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
                {/* login or create acccount button depending on type of auth*/}
                <button
                    type="submit"
                    className="my-10 w-full cursor-pointer rounded-lg bg-purple-800 from-violet-500 to-fuchsia-500 py-4 text-xl font-bold hover:bg-gradient-to-bl md:w-10/12"
                >
                    Reset Password
                </button>
            </Form>
        );
    }

    // email verification auth
    if (isAuthForEmail) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-950 font-bold">
                <div className="flex flex-col items-center xl:flex-row h-6/12 w-11/12 overflow-hidden bg-gray-800 xl:h-[75%] xl:w-[75%]">
                    {/* image */}
                    <div className={`hidden xl:block h-full w-1/2 p-[1%]`}>
                        <img src={authPhoto} alt="auth visual" className="h-full w-full rounded-2xl object-cover" />
                    </div>

                    {/*Message*/}
                    <Outlet />
                </div>
            </div>
        )
    }
    // if normal login/register auth
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gray-950 font-bold">
            <div className="flex h-full w-full overflow-hidden bg-gray-800 sm:h-[75%] sm:w-[90%] md:w-[85%] md:rounded-2xl lg:w-[75%]">
                {/* image */}
                <div className={`hidden h-full w-1/2 p-[1%] xl:block`}>
                    <img src={authPhoto} alt="auth visual" className="h-full w-full rounded-2xl object-cover" />
                </div>

                {/* form */}
                <Outlet context={{ input: [input, setInput], error: [error, setError] }} />
            </div>
        </div>
    )
};
