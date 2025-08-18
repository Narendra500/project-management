import { Outlet } from "react-router";
import NavButton from "#components/ui/NavButton";
import { useState } from "react";
import { useAppContext } from "#contexts/AppContext";

const numberOfProjects = 0;

export function getUserDetailsLeftSection(displayName, isVerified) {
    return (
        <section className="h-128 mt-12 ml-[5%] lg:ml-24 flex flex-col items-center lg:h-10/12 w-11/12 lg:w-6/12 border-1 border-gray-700 rounded-3xl">
            <div className="my-10 text-4xl md:text-5xl lg:text-6xl font-serif">{displayName}</div>
            <NavButton
                navigateTo="change-display-name"
                buttonText="Change Display Name"
                extraClasses=""
            />
            <NavButton
                navigateTo="log-out"
                buttonText="Log out"
                extraClasses=""
            />
            {!isVerified && <div className="px-5 flex flex-col items-center mt-16 text-xl lg:text-3xl">
                <div className="text-red-500 text-center">
                    Your email is not verified, please verify to access other sections
                </div>
                <NavButton
                    navigateTo="/auth/get-email-verification-link/me"
                    buttonText="Send Verification Link"
                    extraClasses="mt-6"
                />
            </div >}
        </section >
    )
}

export function getUserDetailsRightSection() {
    return (
        <section className="h-128 w-11/12 mt-16 ml-[5%] lg:ml-128 lg:h-10/12 lg:w-7/12 border-1 border-gray-700 rounded-3xl inline-block">

        </section>
    )
}

export default function ProfileComponent() {
    const { user } = useAppContext();

    return (
        <div className="h-full flex flex-col">
            <div className="grow scroller">
                {getUserDetailsLeftSection(user.displayName, user.isVerified)}
                {getUserDetailsRightSection()}
            </div>
            <Outlet />
        </div>
    );
}
