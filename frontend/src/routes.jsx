import AuthPage from "#pages/AuthPages";
import ErrorPage from "#pages/ErrorPage";
import VerifyEmailPage from "#components/auth/VerifyEmail";
import App from "./App";

import ProjectComponent from "#components/homepage/ProjectComponent";
import KanBhanComponent from "#components/homepage/KanbhanComponent";
import TreeViewComponent from "#components/homepage/TreeViewComponent";
import ProfileComponent from "#components/homepage/ProfileComponent";

import * as forms from "#components/forms";

import { PopUpMedium } from "#components/ui/PopUp";
import EmailVerificationComponent from "#components/auth/EmailVerificationComponent";

import { loader as loadUserProjects } from "#components/homepage/ProjectComponent";
import { loader as loadUserDetails } from "./App"
import ProtectedLayout from '#components/layouts/ProtectedLayout';

const routes = [
    {
        path: "/",
        element: <App />,
        loader: loadUserDetails,
        errorElement: <ErrorPage />,
        children: [
            // profile route is a top-level child (always accessible) regardless of email verification status
            {
                path: "profile/me",
                element: <ProfileComponent />,
                children: [
                    { path: "change-display-name", element: <PopUpMedium>{<forms.ChangeDisplayNameForm />}</PopUpMedium> },
                ],
            },
            // protected routes are wrapped protected layout not accessible without email verification
            {
                element: <ProtectedLayout />,
                id: 'protected',
                children: [
                    {
                        path: "project/user/me",
                        element: <ProjectComponent />,
                        loader: loadUserProjects,
                        children: [{ path: "create-user-project", element: <PopUpMedium>{<forms.CreateUserProjectForm />}</PopUpMedium> }],
                    },
                    { path: "kanbhan/:projectId", element: <KanBhanComponent /> },
                    { path: "tree-view/:projectId", element: <TreeViewComponent /> },
                ]
            }
        ],
    },
    {
        path: "auth",
        element: <AuthPage />,
        children: [
            { path: "login", element: <forms.AuthForm /> },
            { path: "register", element: <forms.AuthForm /> },
            { path: "get-email-verification-link/me", element: <EmailVerificationComponent /> }
        ],
    },
    {
        path: "/verify-email/:token",
        element: <VerifyEmailPage />,
    }
];

export default routes;
