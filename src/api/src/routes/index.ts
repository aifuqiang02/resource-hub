import { Router } from "express";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import swaggerUi = require("swagger-ui-express");

import { openApiDocument } from "../docs/openapi";
import { sendSuccess } from "../lib/http-response";
import { authRouter } from "../modules/auth/auth.route";
import { notificationsRouter } from "../modules/notifications/notifications.route";
import { rechargeRouter } from "../modules/recharge/recharge.route";
import { resourcesRouter } from "../modules/resources/resources.route";
import { uploadsRouter } from "../modules/uploads/uploads.route";
import { usersRouter } from "../modules/users/users.route";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  return sendSuccess(res, {
    data: {
      status: "ok",
      service: "express-prisma-starter",
      timestamp: new Date().toISOString(),
    },
  });
});

apiRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
apiRouter.get("/openapi.json", (_req, res) =>
  res.status(200).json(openApiDocument),
);

apiRouter.use("/auth", authRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/recharge", rechargeRouter);
apiRouter.use("/resources", resourcesRouter);
apiRouter.use("/uploads", uploadsRouter);
apiRouter.use("/users", usersRouter);
