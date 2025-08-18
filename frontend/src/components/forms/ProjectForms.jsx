import { Form, useNavigate } from "react-router";
import { useState } from "react";
import * as projectServices from "#services/projectServices"
import Input from "#components/ui/Input";
import TextArea from "#components/ui/TextArea";
import NavButton from "#components/ui/NavButton";
import { useProjectsContext } from "#contexts/ProjectsContext";

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
