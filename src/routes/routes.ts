import { Router } from "express";

import guestRouter from "../controllers/guest.controller";
import userRouter from "../controllers/staff.controller";
import reservationRouter from "../controllers/reservation.controller";
import roomRouter from "../controllers/room.controller";
import roomtypeRouter from "../controllers/roomtype.controller";
import departmentRouter from "../controllers/department.controller";

const router = Router();

router.use("/api/v1", guestRouter);
router.use("/api/v1", userRouter);
router.use("/api/v1", reservationRouter);
router.use("/api/v1", roomRouter);
router.use("/api/v1", roomtypeRouter);
router.use("/api/v1", departmentRouter);

export default router;
