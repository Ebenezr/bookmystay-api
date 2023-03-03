import { Router } from "express";

import productRouter from "../controllers/product.controller";
import categoryRouter from "../controllers/category.controller";
import userRouter from "../controllers/user.controller";
import authRouter from "../controllers/auth.controller";

const router = Router();

router.use("/api", productRouter);
router.use("/api", categoryRouter);
router.use("/api", userRouter);
router.use("/api", authRouter);

export default router;
