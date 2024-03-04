/* eslint-disable */

const nodemailer = require('nodemailer');
const {google} = require('googleapis');

const clientId = '576426874690-tf1lidqqmsf96jim6skdhsspigfshcsp.apps.googleusercontent.com';
const clientSecret = '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';
const redirectURI = 'https://developers.google.com/oauthplayground';
const refreshToken = '1//04RAMR8WS2x0XCgYIARAAGAQSNwF-L9IriHO-eWGHbfPwrAq1bbS-1dlG2vK2Z-E_PMcz4ucFhh5ExZDUVrwU5F6Pojhq88HdKkI';

const oAuth2Client = new google.auth.OAuth2(clientId,clientSecret,redirectURI);
oAuth2Client.setCredentials({refresh_token: refreshToken});

const sendEmail = async options =>{
  try{
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service:'gmail',
      auth: {
        type: 'OAuth2',
        user: 'adibala1306@gmail.com',
        clientId,
        clientSecret,
        refreshToken,
        accessToken
      }
    });

    const mailOptions = {
      from: "Adithya B <adibala1306@gmail.com>",
      to: options.email,
      subject: options.subject,
      text: options.text
    }
    const result = await transporter.sendMail(mailOptions);
    console.log(result);
  }catch(err){
    return err;
  }

}

// const sendEmail = async options => {
//   // 1. Create a transporter
//   const transporter = nodemailer.createTransport({
//     host: "live.smtp.mailtrap.io",
//     port: 587,
//     auth: {
//       user: "api",
//       pass: "d9fb706d1a023705395ea5b3e6f5d4d0"
//     }
//     // Activate "less secure app" option in gmail
//   })
//   // 2. Define the email options
//   const mailOptions = {
//     from: 'Adithya B <mailtrap@bookmytour.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     //html: 
//   }
//   // 3. Send the email
//   //console.log(mailOptions);
//   await transporter.sendMail(mailOptions);
  
// };

module.exports = sendEmail;