/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import AzMailer from 'library';

let expect = chai.expect;

const sendResetPasswordMail = (azMailer, target, resetLink, resetCode) => {
  let targets = target;
  if(Array.isArray(target)){
    targets = target.join(', ');
  }
  return azMailer.createTransporter('test')
  .then(transporter => {
    const result = azMailer.renderMail('template/reset-password.mjml', {
      serviceName: 'Az Service',
      resetPasswordUrl: resetLink,
      resetPasswordCode: resetCode,
      domainName: 'az-authn.io',
      supportEmail: 'support@az-authn.io',
    });

    if (result.error) {
      console.log('result.error :', result.error);
      return Promise.reject(result.error);
    }

    // setup email data with unicode symbols
    let mailOptions = {
      from: '"Az Service" <no-reply@az-authn.io', // sender address
      to: targets, // list of receivers
      subject: 'Reset your password', // Subject line
      text: `Reset link: ${resetLink}`, // plain text body
      // HTML body
      html: result.mailHtml,// fs.readFileSync(path.join(__dirname, 'assets/template.html'), 'utf8'),
    };

    // send mail with defined transport object
    return transporter.sendMail(mailOptions);
  })
  .then(info => {
    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', azMailer.nodemailer.getTestMessageUrl(info));
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  });
}

describe('Main Test Cases', function(){
  describe('Basic', function(){
    this.timeout(10000);
    it('should be able to send mails', () => {
      expect(AzMailer).to.be.an.instanceof(Function);
      const azMailer = new AzMailer('./ejs-mjml');
      return sendResetPasswordMail(azMailer, 'xtforgame@gmail.com', 'https://localhost:8443/', '123456');
    });
  });
});

/*
// Get state.
router.get('/api/mail-preview/:template', (ctx, next) => {
  const result = azMailer.renderMail(ctx.params.template);
  if (result.error) {
    return ctx.throw(404);
  }
  return ctx.body = result.mailHtml;
});

router.get('/api/mjml-preview/:template', (ctx, next) => {
  const result = azMailer.renderMail(ctx.params.template);
  if (result.error) {
    return ctx.throw(404);
  }
  ctx.set('Content-Type', 'text/xml');
  return ctx.body = result.mailMjml;
});
*/
