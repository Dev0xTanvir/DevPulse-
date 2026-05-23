import { Router } from "express";
import { issuecontroller } from "./issue.controller";
import auth from "../../../middleware/auth";

const router = Router();

router.post("/", auth("contributor", "maintainer"), issuecontroller.creatissue);
router.get("/", issuecontroller.getallissue);
router.get("/:id", issuecontroller.getsingleissue);
router.patch(
  "/:id",
  auth("contributor", "maintainer"),
  issuecontroller.updateissue,
);
router.delete("/:id", auth("maintainer"), issuecontroller.deleteissue);

export const issueRoute = router;
