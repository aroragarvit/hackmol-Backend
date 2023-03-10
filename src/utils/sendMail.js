import nodemailer from "nodemailer";

export async function sendMail(email, token) {
  try {
    var transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // use SSL/TLS,

      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Email Verification",
      text: `http://localhost:5000/verify?token=${token}`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
  }
}
