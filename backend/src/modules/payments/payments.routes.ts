import { Router } from "express";
import { webhook } from "./payments.controller";

export const paymentsRouter = Router();

paymentsRouter.post("/webhook", webhook);
