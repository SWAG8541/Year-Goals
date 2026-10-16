import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { WhatsAppController } from "../controllers/whatsappController";

const router = Router();
router.use(authMiddleware);
router.post('/toggle', WhatsAppController.toggle);
router.get('/reminder-link', WhatsAppController.getReminderLink);
router.get('/status', WhatsAppController.getStatus)

export { router as whatsappRoutes };
