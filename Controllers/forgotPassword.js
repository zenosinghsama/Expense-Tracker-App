const uuid = require("uuid");
const bcrypt = require("bcrypt");
require('dotenv').config();
const nodemailer = require("nodemailer");

const UserModel = require("../Models/userModel");
const forgotPassModel = require("../Models/forgotPassModel");

const sendEmail = async (toEmail, subject, htmlContent) => {
  try{
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return new Promise((resolve, reject) => {
    transporter.sendMail({ from: process.env.EMAIL, to: toEmail, subject, html: htmlContent}, (err, info) => {
      if(err) {
        console.log("ERROR OCCURRED IN SENDING MAIL", err);
        reject(err);
      } else {
        console.log("EMAIL SENT SUCCESSFULLY");
        resolve(info);
      }
     });
  });
} catch(err) {
  console.log("ERROR OCCURRED IN SENDING MAIL",err);
  throw err
}
}

const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "USER DOES NOT EXISTS" });
    } 

      const id = uuid.v4();
      const addForgot = await forgotPassModel.create({ id, active: true, userId: user.dataValues.id });
      if (!addForgot) {
        throw new Error ("ERROR IN CREATING REQUEST");
        }

      const emailContent = `<a href = "/password/resetpassword/{id}">CLICK HERE </a>`;
        await sendEmail(email, "RESET YOUR PASSWORD", emailContent);

        return res.status(202).json({ message: "RESET YOUR PASSWORD BY CLICKING ON THE LINK BELOW ", success: true });
  } catch (err) {
    console.log("ERROR IN FORGOT PASSWORD:",err)
    return res.status(500).json({ message: "RESET LINK NOT SENT", success: false });
  }
};

const resetpassword = async (req, res) => {
  const id = req.params.id;
  try{
    const forgotPasswordRequest = await forgotPassModel.findOne({ where: { id, active: true } });
    if(!forgotPasswordRequest) {
      return res.status(404).send("RESET PASSWORD LINK NOT FOUND");
    }

    await forgotPasswordRequest.update({ active: false });

    const formHtml = `
      <html>
      <script>
        function formSubmitted(e) {
          e.preventDefault();
          console.log('called');
        }
      </script>
      
      <form action = "/password/updatepassword/${id}" method="get">
        <label for = "newpassword">ENTER NEW PASSWORD </label>
        <input name = "newpassword" type="password" required></input>
        <button>RESET PASSWORD</button>
      </form>
      </html> `;

      return res.status(200).send(formHtml);
  } catch(err) {
    console.log("ERROR IN RESETTING PASSWORD",err);
    return res.status(500).send("ERROR OCCURRED DURING RESET PASSWORD PROCESS")
  }
};

const updatePassword = async (req, res) => {
  try {
    const { newpassword } = req.query;
    const { resetpasswordid } = req.params;

    const validUser = await forgotPassModel.findOne({ where: { id: resetpasswordid } });
    if(!validUser) {
      return res.status(404).json({ error: "INVALID RESET PASSWORD LINK", success: false });
    } 
    
    const user = await UserModel.findOne({ where: { id: validUser.userId } });
        if (!user) {
          return res.status(404).json({ error: "USER NOT FOUND", success: false }); 
        }

        const hashedPassword = await hashPassword(newpassword);
        await user.update({ password: hashedPassword });

        return res.status(200).json({ message: "PASSWORD UPDATED SUCCESSFULLY", success: true });
  } catch (err) {
    console.log("ERROR IN updatePassword", err);
    return res.status(500).json({ err: "INTERNAL SERVER ERROR", success: false });
  }
};

module.exports = {
  forgotPassword,
  updatePassword,
  resetpassword,
};