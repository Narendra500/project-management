import { Router } from "express";
import * as categoryController from "#api/categories/category.controller";

const router = Router();

router.post("/create", categoryController.createCategory);

export default router;
