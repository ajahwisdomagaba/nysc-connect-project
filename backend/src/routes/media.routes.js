import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";
import { uploadAccommodationImages, uploadVerificationDocument } from "../controllers/media.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/accommodation-images",
  protect,
  restrictTo("admin", "landlord", "agent"),
  upload.array("photos", 3),
  uploadAccommodationImages,
);

router.post(
  "/verification-documents",
  protect,
  restrictTo("landlord", "agent"),
  upload.single("document"),
  uploadVerificationDocument,
);

export default router;