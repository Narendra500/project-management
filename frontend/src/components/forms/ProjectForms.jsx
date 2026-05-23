import { Form, useNavigate, useParams } from "react-router";
import { useState } from "react";
import * as projectServices from "#services/projectServices"
import Input from "#components/ui/Input";
import NavButton from "#components/ui/NavButton";
import { useProjectsContext } from "#contexts/ProjectsContext";
import LongInput from "#components/ui/LongInput";

export function CreateUserProjectForm() {
    const [input, setInput] = useState({
        projectName: "",
        projectDescription: ""
    });
    const { projects, setProjects } = useProjectsContext();
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

        localStorage.setItem(`project-${response.data.uuid}-expansionState`, "{}");

        projects.push(response.data);
        setProjects(projects);

        navigate("/project/user/me");
    };

    return (
        <Form onSubmit={handleSubmit} className="flex w-full h-full flex-col items-center justify-center">
            <div className="mb-6 text-2xl">Create Project</div>
            <Input name="projectName" onChange={handleInput} placeholder="Project name" isRequired={true} />
            <LongInput name="projectDescription" onChange={handleInput} placeholder="Project description" cssClasses="h-8/12" />
            <NavButton type={"submit"} buttonText={"Confirm"} extraClasses="w-8/12" />
        </Form >
    );
}

export function InviteUsersForm() {
    const [input, setInput] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const projectUuid = useParams().projectUuid;

    const handleInput = (e) => {
        const { value } = e.target;
        setInput(value);
    }

    const handleSubmit = async () => {
        setSuccess(null);
        setError(null);
        const response = await projectServices.inviteUsers(projectUuid, input);
        if (response.success) {
            setSuccess(response.message);
            setInput("");
        } else {
            setError(response.message);
        }
    }

    return (
        <Form onSubmit={handleSubmit} className="h-full w-full flex flex-col items-center">
            {error && <div className="text-red-700">{error}</div>}
            {success && <div className="text-green-700">{success}</div>}
            <div className="mb-6 text-2xl">Invite users to project</div>
            <input name="emails" className="input" onChange={handleInput} value={input} placeholder="Emails" required={true} />
            <div className="text-xl mb-4">
                Enter comma separated emails of users to invite to the project
            </div>
            <div className="w-1/3 h-full flex flex-col justify-end">
                <button type={"submit"} className="button mb-[10%]">Confirm</button>
            </div>
        </Form>
    );
}
