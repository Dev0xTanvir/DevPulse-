import { Router } from "express";
import { issuecontroller } from "./issue.controller";
import auth from "../../../middleware/auth";

const router = Router();

router.post("/", auth("contributor", "maintainer"), issuecontroller.creatissue);
router.get("/", issuecontroller.getallissue);
router.get("/:id", issuecontroller.getsingleissue);

export const issueRoute = router;
