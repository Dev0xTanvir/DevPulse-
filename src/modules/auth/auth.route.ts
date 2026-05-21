import { Router } from "express";
import { authcontroller } from "./auth.controller";

const router = Router();

router.post("/signup", authcontroller.createsingup);
router.post("/login", authcontroller.createlogin);

export const authRoute = router;
