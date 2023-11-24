import {createTransport} from "nodemailer"

export const sendEmail =async (to,subject,text)=>{

var transporter = createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "b110d9fdeea75f",
      pass: "d21e40107fefe4"
    }
  });

await transporter.sendMail({
    to,
    subject,
    text
})

}