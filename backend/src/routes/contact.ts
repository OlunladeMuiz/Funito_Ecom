import express, { Request, Response } from "express";
const expressValidator = require("express-validator");
const body = expressValidator.body;
const validationResult = expressValidator.validationResult;
import rateLimit from "express-rate-limit";
import sanitizeHtml from "sanitize-html";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import winston from "winston";

dotenv.config();

const router = express.Router();

// Logging setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

// Validate required environment variables at startup
const requiredEnv = ["SENDGRID_API_KEY", "SENDGRID_VERIFIED_SENDER", "CONTACT_RECEIVER_EMAIL"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    logger.error(`Missing required environment variable: ${key}`);
    // Optionally: process.exit(1);
  }
}

// Rate limiter: 5 requests per IP per hour
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Set SendGrid API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Validation and sanitization middleware
const validateContact = [
  body("name").trim().notEmpty().withMessage("Name is required").escape(),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("subject").trim().notEmpty().withMessage("Subject is required").escape(),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .customSanitizer((value: string) => sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })),
];

  router.post(
    "/api/contact",
    limiter,
    validateContact,
    async (req: Request, res: Response) => {
      // Input validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn("Validation failed", { errors: errors.array() });
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, subject, message } = req.body as {
        name: string;
        email: string;
        subject: string;
        message: string;
      };

      // Email header injection prevention
      if (/[\r\n]/.test(name) || /[\r\n]/.test(subject)) {
        logger.warn("Header injection attempt", { name, subject });
        return res.status(400).json({ error: "Invalid input." });
      }

      // Compose email
      const msg = {
        to: process.env.CONTACT_RECEIVER_EMAIL as string,
        from: process.env.SENDGRID_VERIFIED_SENDER as string,
        subject: `[Contact Form] ${subject}`,
        replyTo: email,
        html: `
          <h2>Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
        `,
      };

      // Send email with robust error handling and logging
      try {
        await sgMail.send(msg);
        logger.info("Contact email sent", { email, subject });
        return res.status(200).json({ message: "Message sent successfully." });
      } catch (err: any) {
        // SendGrid errors
        logger.error("SendGrid error", { error: err.message, code: err.code, response: err.response?.body });
        // TODO: Optionally queue failed emails for retry (future scalability)
        return res.status(502).json({ error: "Failed to send message. Please try again later." });


      }
    }
  );

export default router;