import { Router } from "express";

import { validate } from "../../middlewares/validate";

import {
  listHotKeywordsController,
  recordSearchController,
} from "./search.controller";
import {
  listHotKeywordsSchema,
  recordSearchSchema,
} from "./search.schema";

export const searchRouter = Router();

searchRouter.post(
  "/record",
  validate(recordSearchSchema),
  recordSearchController,
);

searchRouter.get(
  "/hot",
  validate(listHotKeywordsSchema),
  listHotKeywordsController,
);
