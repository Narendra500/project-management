import { Router } from "express";
import * as featureController from "#api/features/feature.controller";

const router = Router();

router.post("/create", featureController.createFeature);
router.put("/update", featureController.updateFeatureDetails);

export default router;
