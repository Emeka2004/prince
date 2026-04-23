import express from "express";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  
  // Use express JSON body parser for POST requests
  app.use(express.json());

  // Configure Nodemailer for Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.MOUAU_KEY,
    },
  });

  // API route for email verification
  app.post("/api/send-verification", async (req, res) => {
    const { email, username, code } = req.body;
    console.log("Received verification request for:", email);

    if (!process.env.MOUAU_KEY || !process.env.GMAIL_USER) {
      console.error("Gmail configuration (MOUAU_KEY or GMAIL_USER) is not defined");
      return res.status(500).json({ error: "Email configuration missing" });
    }

    try {
      const info = await transporter.sendMail({
        from: `"Smart Material Recommender" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Your Verification Code',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5; text-align: center;">Smart Material Recommender</h2>
            <p>Hi <strong>${username}</strong>,</p>
            <p>Thank you for signing up! Use the following 6-digit code to verify your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 10px 20px; border-radius: 8px;">${code}</span>
            </div>
            <p>If you didn't request this code, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #64748b; text-align: center;">&copy; 2026 Smart Material Recommender. All rights reserved.</p>
          </div>
        `,
      });

      console.log("Email sent successfully: %s", info.messageId);
      res.status(200).json({ data: info });
    } catch (err: any) {
      console.error("Email sending error:", err);
      res.status(500).json({ error: err.message || "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
