import { Router } from "express";
import * as featureDetailsController from "#api/featureDetails/feature.detail.controller";

const router = Router();

router.patch("/updateDetails/:featureUuid", featureDetailsController.updateFeatureDetails);
router.get("/:projectUuid/:categoryUuid/:featureUuid", featureDetailsController.getFeatureDetails);

export default router;
