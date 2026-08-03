const sgMail = require("@sendgrid/mail");
const logger = require("../../utils/logger");


class TwilioService {

  // Send generic email
  static async sendEmail({ to, subject, html }) {
    try {
      if (process.env.MAIL_MODE === "console" || !process.env.SENDGRID_API_KEY) {
        logger.info(`[mail:console] to=${to} subject=${subject}`);
        return { mocked: true };
      }

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to,
        from: process.env.SENDER_EMAIL,
        subject,
        html,
      };

      await sgMail.send(msg);
      logger.info(`SendGrid: Email sent to ${to} with subject "${subject}"`);
      return { mocked: false };
    } catch (err) {
      logger.error(`SendGrid: Failed to send email to ${to} - ${err.message}`);
      throw err;
    }
  }

  // Send appointment confirmation emails
  static async sendAppointmentEmail({ appointment, patient, psychologist }) {
    try {
      const formattedDate = `${appointment.day.charAt(0).toUpperCase() + appointment.day.slice(1)}, ${appointment.start} - ${appointment.end}`;

      const emails = [
        {
          to: patient.email,
          subject: "Confirmación de tu cita psicológica 🧠",
          html: `
            <h2>Hola ${patient.name},</h2>
            <p>Tu cita con <b>${psychologist.name} ${psychologist.last_name1}</b> ha sido programada exitosamente.</p>
            <ul>
              <li><b>Fecha:</b> ${formattedDate}</li>
              <li><b>Duración:</b> 1 hora</li>
              <li><b>Estado:</b> ${appointment.status}</li>
            </ul>
            <p>Por favor llega a tiempo a tu sesión.</p>
            <p style="color:gray;font-size:12px;">Rompe tus límites. Cuida tu mente 💪</p>
          `,
        },
        {
          to: psychologist.email,
          subject: "Nueva cita programada con un paciente 🗓️",
          html: `
            <h2>Hola ${psychologist.name},</h2>
            <p>Se ha hecho una reservación para una cita.</p>
            <ul>
              <li><b>Paciente:</b> ${patient.name} ${patient.last_name1}</li>
              <li><b>Fecha:</b> ${formattedDate}</li>
              <li><b>Duración:</b> 1 hora</li>
            </ul>
          `,
        },
      ];

      await Promise.all(emails.map(email => this.sendEmail(email)));

      logger.info(`SendGrid: Appointment emails sent to patient: ${patient.email} and psychologist: ${psychologist.email}`);
    } catch (err) {
      logger.error(`SendGrid: Appointment emails failed: ${err.message}`);
    }
  }

  // Send password reset code email
  static async sendPasswordResetEmail(user, code) {
    try {
      const html = `
        <h2>Hola ${user.name},</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Tu código de verificación es:</p>
        <h1 style="letter-spacing: 3px; color: #5A4FCF;">${code}</h1>
        <p>Este código expirará en <b>${process.env.RESET_CODE_TTL / 60} minutos</b>.</p>
        <p>Si no realizaste esta solicitud, puedes ignorar este mensaje.</p>
        <br>
        <p style="color:gray;font-size:12px;">Rompe tus límites. Cuida tu mente 💪</p>
      `;

      await this.sendEmail({
        to: user.email,
        subject: "Recuperación de contraseña 🔒",
        html,
      });
    } catch (err) {
      logger.error(`SendGrid: Failed to send password reset email to ${user.email} - ${err.message}`);
    }
  }
}

module.exports = TwilioService;
