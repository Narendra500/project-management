import { Router } from "express";
import * as projectUsersController from "#api/projectUsers/project.users.controller";

const router = Router();

router.get("/:projectUuid", projectUsersController.getProjectUsers);
router.

export default router;
