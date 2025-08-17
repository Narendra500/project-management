import { Link, useRouteLoaderData } from "react-router";
import { useState } from "react";
import { useAppContext } from "../contexts/AppContext";

export default function NavBar() {
    const [isMenuActive, setMenuStatus] = useState(false);
    const { user } = useAppContext();
    const activeProjectId = user.activeProjectId;

    const toggleMenuState = () => {
        setMenuStatus(!isMenuActive);
    };

    const navClass =
        "hidden md:inline text-[22px] mx-5 opacity-70 font-semibold text-purple-100 hover:border-b-2 hover:border-b-purple-200";

    const navClassMenu =
        "block text-[22px] mx-5 sm:ml-10 my-8 opacity-70 font-semibold text-purple-100 hover:border-b-2 hover:border-b-purple-200";

    return (
        <nav className="flex min-h-1/12 border-b-gray-700 sm:border-b-2">
            {/* logo section */}
            <section className="w-2/12 ml-[4%] flex h-full flex-col justify-center">
                <Link to="/" className="flex">
                    <img src="/OrbitLogo-Medium.svg" alt="Orbit Logo" />
                    <img src="/OrbitText-Medium.svg" alt="Orbit in Text" className="inline-block md:ml-6" />
                </Link>
            </section>
            <section className="ml-auto items-center justify-end self-center sm:flex md:w-11/12">
                {/* toggles menu on small screens*/}
                <button
                    type="button"
                    onClick={toggleMenuState}
                    className="px-6 py-2 text-xl text-purple-200 opacity-80 md:hidden"
                >
                    {isMenuActive ? "Hide Menu" : "Show Menu"}
                </button>
                {/* navigation links */}
                <Link to="project/user/me" className={navClass}>
                    Projects
                </Link>
                <Link to={`tree-view/${activeProjectId}`} className={navClass}>
                    Tree View
                </Link>
                <Link to={`kanbhan/${activeProjectId}`} className={navClass}>
                    Kanbhan
                </Link>
                <Link to="profile/me" className={navClass + " mr-[5%] ml-[5%]"}>
                    Profile
                </Link>
            </section >

            {/* pop menu when on small screens */}
            < div
                className={`${isMenuActive ? "block" : "hidden"} bg-gray-900 absolute h-74 translate-x-full translate-y-20 w-1/2 rounded-xl border-2 border-purple-200 md:hidden`
                }
            >
                <Link to="project/byUserId/me" className={navClassMenu}>
                    Projects
                </Link >
                <Link to={`tree-view/${activeProjectId}`} className={navClassMenu}>
                    Tree View
                </Link>
                <Link to={`kanbhan/${activeProjectId}`} className={navClassMenu}>
                    Kanbhan
                </Link>
                <Link to="profile/me" className={navClassMenu}>
                    Profile
                </Link>
            </div >
        </nav >
    );
}
