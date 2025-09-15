import { Router } from "express";
import * as featureDetailsController from "#api/featureDetails/feature.detail.controller";

const router = Router();

router.patch("/:encodedFeatureId/updateDetails", featureDetailsController.updateFeatureDetails);
router.get("/:encodedProjectId/:encodedCategoryId/:encodedFeatureId", featureDetailsController.getFeatureDetails);

export default router;
