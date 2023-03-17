import { Router } from "express";

import productRouter from "../controllers/product.controller";


const router = Router();

router.use("/api", productRouter);


export default router;
