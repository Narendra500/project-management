import { Router } from "express";
import * as projectUsersController from "#api/projectUsers/project.users.controller";

const router = Router();

router.get("/:encodedProjectId", projectUsersController.getProjectUsers);

export default router;
