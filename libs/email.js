const { emailKey } = require('../config')
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(emailKey)
const sendEmail = (to, subject, text, html) => {
  sgMail.send({
    to,
    from: 'valentingiarra2@gmail.com',
    subject,
    text,
    html
  })
    .then(() => {
      console.log('Email sent')
      return { success: true }
    })
}

module.exports = sendEmail
