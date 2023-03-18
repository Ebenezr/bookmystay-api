import { Router } from "express";

import guestRouter from "../controllers/guest.controller";
import userRouter from "../controllers/staff.controller";

const router = Router();

router.use("/api/v1", guestRouter);
router.use("/api/v1", userRouter);

export default router;
