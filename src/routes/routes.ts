import { Router } from "express";

import guestRouter from "../controllers/guest.controller";


const router = Router();

router.use("/api/v1", guestRouter);


export default router;
