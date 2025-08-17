import { Outlet } from "react-router";
import NavButton from "#components/ui/NavButton";
import { useState } from "react";
import { useAppContext } from "../../contexts/AppContext";

const numberOfProjects = 0;

export function getUserDisplayNameComponent(displayName) {
    return (
        <div className="flex w-full grow-1 items-center border-b-2 border-b-gray-800 pl-10 text-3xl">
            <div className="w-7/12">Display Name: {displayName}</div>
            <div className="flex w-5/12 justify-end">
                <NavButton
                    navigateTo="change-display-name"
                    buttonText="Change Display Name"
                    extraClasses="mr-14"
                />
            </div>
        </div>
    )
}

export function getUserVerificationComponent(isVerified) {
    return (
        <div className="flex w-full grow-1 items-center border-b-2 border-b-gray-800 pl-10 text-3xl">
            <div className={`w-7/12 ${isVerified ? "" : "text-red-500"}`}>
                {isVerified ? "Your email is verified" : "Your email is not verified"}
            </div>
            {
                isVerified ? "" : <div className="flex w-5/12 justify-end" >
                    <NavButton
                        navigateTo="/auth/get-email-verification-link/me"
                        buttonText="Send Verification Link"
                        extraClasses="mr-14"
                    />
                </div>
            }
        </div >
    )
}

export default function ProfileComponent() {
    const [error, setError] = useState(null);
    const { user } = useAppContext();

    return (
        <div className='flex h-full'>
            <section className={"flex w-full flex-col content-baseline justify-evenly"}>
                {getUserDisplayNameComponent(user.displayName)}
                {getUserVerificationComponent(user.isVerified)}
                <div className="flex grow-1 items-center justify-baseline border-b-2 border-b-gray-800 pl-10 text-3xl">
                    Number of Projects Owned: {numberOfProjects}
                </div>
                <div className="flex grow-1 items-center border-b-2 border-b-gray-800 pl-10 text-3xl">
                    Number of Projects Member in: {numberOfProjects}
                </div>
                <div className="flex grow-1 items-center pl-10 text-3xl">Total Number of Projects: {numberOfProjects}</div>
            </section>
            <Outlet context={{ error: [error, setError] }} />
        </div>
    );
}
