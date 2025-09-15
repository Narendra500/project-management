import { Router } from "express";
import authMiddleware from "#middlewares/auth.middleware";
import authRoutes from "#api/auth/auth.routes";
import userRoutes from "#api/users/user.routes";
import projectRoutes from "#api/projects/project.routes";
import projectRoleRoutes from "#api/projectRoles/project.role.routes";
import projectUserRoutes from "#api/projectUsers/project.users.routes";
import categoryRoutes from "#api/categories/category.routes";
import featureRoutes from "#api/features/feature.routes";
import featureDetailRoutes from "#api/featureDetails/feature.detail.routes";

const router = Router();

// mount the individual routers on the main api router
router.use("/auth", authRoutes);
router.use("/user", authMiddleware, userRoutes);
router.use("/project", authMiddleware, projectRoutes);
router.use("/projectRole", authMiddleware, projectRoleRoutes);
router.use("/projectUsers/", authMiddleware, projectUserRoutes);
router.use("/category", authMiddleware, categoryRoutes);
router.use("/feature", authMiddleware, featureRoutes);
router.use("/featureDetail", authMiddleware, featureDetailRoutes);

export default router;
