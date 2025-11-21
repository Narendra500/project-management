import { Router } from "express";
import * as projectController from "#api/projects/project.controller";

const router = Router();

router.post("/create", projectController.createProject);
router.get("/user/me", projectController.getUserProjects);
router.get("/:projectUuid", projectController.getAllProjectCategoriesAndFeatures);
router.get("/soft-deleted-nodes/:projectUuid", projectController.getAllSoftDeletedProjectNodes);
router.patch("/soft-delete-project/:projectUuid/user/me", projectController.softDeleteUserProject);
router.patch("/reverse-soft-delete-project/:projectUuid/user/me", projectController.reverseSoftDeleteUserProject);

export default router;
