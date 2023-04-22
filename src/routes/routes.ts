import { Router } from "express";

import guestRouter from "../controllers/guest.controller";
import userRouter from "../controllers/staff.controller";
import reservationRouter from "../controllers/reservation.controller";
import roomRouter from "../controllers/room.controller";
import roomtypeRouter from "../controllers/roomtype.controller";
import departmentRouter from "../controllers/department.controller";
import taxRouter from "../controllers/tax.controller";
import currencyRouter from "../controllers/currency.controller";
import paymentmodeRouter from "../controllers/paymentmode.controller";
import companyRouter from "../controllers/company.controller";
import authRouter from "../controllers/auth.controller";
import bedRouter from "../controllers/bed.controller";
import serviceRouter from "../controllers/service.controller";
import serviceTypeRouter from "../controllers/servicetype.controller";
import serviceListRouter from "../controllers/servicelist.controller";
import floorRouter from "../controllers/floor.controller";
import paymentRouter from "../controllers/payment.controller";
import amenityRouter from "../controllers/amenity.controller";
import backupRouter from "../controllers/backup.controller";
import discountRouter from "../controllers/discount.controller";
import multerRouter from "../middleware/multer.middleware";

const router = Router();

router.use("/api/v1", guestRouter);
router.use("/api/v1", userRouter);
router.use("/api/v1", reservationRouter);
router.use("/api/v1", roomRouter);
router.use("/api/v1", roomtypeRouter);
router.use("/api/v1", departmentRouter);
router.use("/api/v1", taxRouter);
router.use("/api/v1", currencyRouter);
router.use("/api/v1", paymentmodeRouter);
router.use("/api/v1", companyRouter);
router.use("/api/v1", authRouter);
router.use("/api/v1", serviceRouter);
router.use("/api/v1", bedRouter);
router.use("/api/v1", serviceTypeRouter);
router.use("/api/v1", serviceListRouter);
router.use("/api/v1", floorRouter);
router.use("/api/v1", paymentRouter);
router.use("/api/v1", amenityRouter);
router.use("/api/v1", backupRouter);
router.use("/api/v1", discountRouter);
router.use("/api/v1", multerRouter);

export default router;
