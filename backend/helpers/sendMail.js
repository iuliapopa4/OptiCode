const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const OAUTH_PLAYGROUND = "https://developers.google.com/oauthplayground";
require("dotenv").config();

const { G_CLIENT_ID, G_CLIENT_SECRET, G_REFRESH_TOKEN, ADMIN_EMAIL } =
  process.env;

const oauth2client = new OAuth2(
  G_CLIENT_ID,
  G_CLIENT_SECRET,
  G_REFRESH_TOKEN,
  OAUTH_PLAYGROUND
);

const sendEmailRegister = (to, url, text) => {
  // Set credentials for OAuth2 client
  oauth2client.setCredentials({
    refresh_token: G_REFRESH_TOKEN,
  });

  const accessToken = oauth2client.getAccessToken();

  // Configure SMTP transporter with Gmail and OAuth2 authentication
  const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: ADMIN_EMAIL,
      clientId: G_CLIENT_ID,
      clientSecret: G_CLIENT_SECRET,
      refreshToken: G_REFRESH_TOKEN,
      accessToken,
    },
  });

  const mailOptions = {
    from: ADMIN_EMAIL,
    to: to,
    subject: "ACTIVATE YOUR ACCOUNT",
    html: `
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap"
      rel="stylesheet"
    />
    <title>Account Activation</title>
    <style>
      body {
        background-color: #333333;
        height: 100vh;
        font-family: "Roboto", sans-serif;
        color: #fff;
        position: relative;
        text-align: center;
      }
      .container {
        max-width: 700px;
        width: 100%;
        height: 100%;
        margin: 0 auto;
      }
      .wrapper {
        padding: 0 15px;
      }
      .card {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
      }
      span {
        color: #4979a7;
      }
      button {
        margin: 1em 0;
        font-size: 16px;
        padding: 1.2em;
        border-radius: 5px;
        border: none;
        width: 370px;
        color: #fff;
        cursor: pointer;
        outline: none;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(to right, #6899c8, #4979a7);
      }
      button:hover {
        transition: all 0.3s ease;
        background: linear-gradient(to left, #6899c8, #4979a7);
      }
      .spacing {
        margin-top: 5rem;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="wrapper">
        <div class="card">
          <h1><span>Welcome to OptiCode!</span></h1>
          <p>Please validate your email by clicking the button below </p>
          <a href=${url}><button>${text}</button></a>
          <p class="spacing">
            If the button above does not work, please navigate to the link
            provided below 
          </p>
          <div>${url}</div>
        </div>
      </div>
    </div>
  </body>
</html>
  `,
  };

  smtpTransport.sendMail(mailOptions, (err, info) => {
    if (err) return { err };
    return info;
  });
};

// Password reset email
const sendEmailReset = (to, url, text, name) => {
  oauth2client.setCredentials({
    refresh_token: G_REFRESH_TOKEN,
  });
  const accessToken = oauth2client.getAccessToken();
  const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: ADMIN_EMAIL,
      clientId: G_CLIENT_ID,
      clientSecret: G_CLIENT_SECRET,
      refreshToken: G_REFRESH_TOKEN,
      accessToken,
    },
  });

  const mailOptions = {
    from: ADMIN_EMAIL,
    to: to,
    subject: "RESET PASSWORD",
    html: `
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap"
        rel="stylesheet"
      />
      <title>Reset Password</title>
      <style>
        body {
          background-color: #333333;
          height: 100vh;
          font-family: "Roboto", sans-serif;
          color: #fff;
          position: relative;
          text-align: center;
        }
        .container {
          max-width: 700px;
          width: 100%;
          height: 100%;
          margin: 0 auto;
        }
        .wrapper {
          padding: 0 15px;
        }
        .card {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
        }
        span {
          color: #4979a7;
        }
        button {
          margin: 1em 0;
          font-size: 16px;
          padding: 1.2em;
          border-radius: 5px;
          border: none;
          width: 370px;
          color: #fff;
          cursor: pointer;
          outline: none;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(to right, #6899c8, #4979a7);
        }
        button:hover {
          transition: all 0.3s ease;
          background: linear-gradient(to left, #6899c8, #4979a7);
        }
        .spacing {
          margin-top: 5rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="wrapper">
          <div class="card">
            <h1><span>Hey</span> ${name}</h1>
            <p>Please click the button below to reset your password.</p>
            <a href=${url}><button>${text}</button></a>
            <p class="spacing">
              If the button above does not work, please navigate to the link
              provided below 
            </p>
            <div>${url}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
  };

  smtpTransport.sendMail(mailOptions, (err, info) => {
    if (err) return { err };
    return info;
  });
};

module.exports = { sendEmailRegister, sendEmailReset };