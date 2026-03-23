export const sendEmail = async ({ email, subject, message }) => {
  const payload = {
    sender: {
      name: "Ecommerce Store",
      email: process.env.SMTP_MAIL, // This must be the email you verify in Brevo!
    },
    to: [{ email: email }],
    subject: subject,
    htmlContent: message,
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to send email via Brevo API.");
  }
};
