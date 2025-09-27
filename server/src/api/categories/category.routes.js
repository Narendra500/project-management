import { Router } from "express";
import * as categoryController from "#api/categories/category.controller";

const router = Router();

router.post("/create", categoryController.createCategory);
router.get("/:projectUuid/:categoryUuid", categoryController.getCategoryDetails);

export default router;
