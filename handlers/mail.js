const nodemailer = require("nodemailer");
const pug = require("pug");
const juice = require("juice");
const htmlToText = require("html-to-text");
const promisify = require("es6-promisify");

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    ciphers: "SSLv3",
  },
});

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(
    `${__dirname}/../views/email/${filename}.pug`,
    options,
  );
  const inline = juice(html);
  return inline;
};

exports.send = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);
  const mailOptions = {
    from: "NCUJHS.tech <ncujhs.tech@ncsuvt.org>",
    to: options.email,
    subject: options.subject,
    html: html,
    text: text,
    replyTo: options.replyTo,
  };

  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};
