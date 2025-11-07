import { Router } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.post("/send", async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  if (!firstName || !email || !message) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    // Configurar el transporter con tu correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"ProClean Contact" <${process.env.CONTACT_EMAIL}>`,
      to: process.env.CONTACT_EMAIL, // Te llega a ti
      subject: `Nuevo mensaje: ${firstName} ${lastName || ""}`,
      text: `
Nombre: ${firstName} ${lastName || ""}
Email: ${email}

Mensaje:
${message}
      `,
    });

    res.json({ success: true, message: "Mensaje enviado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error enviando el mensaje" });
  }
});

export default router;
