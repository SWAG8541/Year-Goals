import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import { WhatsAppService } from "../services/whatsappService";
import { handleControllerError } from "../utils/httpError";

export class WhatsAppController {
  static async toggle(req: AuthRequest, res: Response) {
    try {
      res.json(await WhatsAppService.toggle(req.userId!, req.body.enabled));
    } catch (error) {
      handleControllerError(error, res, "Failed to update WhatsApp notifications");
    }
  }

  static async getReminderLink(req: AuthRequest, res: Response) {
    try {
      res.json(await WhatsAppService.getReminderLink(req.userId!));
    } catch (error) {
      handleControllerError(error, res, "Failed to generate WhatsApp link");
    }
  }
}
