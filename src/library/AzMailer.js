import fs from 'fs';
import path from 'path';

import ejs from 'ejs';
import mjml from 'mjml';
import nodemailer from 'nodemailer';

export default class AzMailer {
  constructor(tmplBasePath){
    this.ejs = ejs;
    this.mjml = mjml;
    this.nodemailer = nodemailer;

    this.tmplBasePath = path.resolve(tmplBasePath || './');
    this.testAccount = null;
    this.testTransporter = null;
  }

  renderMail(tmplFilename, ejsParams = {}, mjmlOprions = {}) {
    const result = {};
    try {
      result.mailEjsMjml = fs.readFileSync(path.join(this.tmplBasePath, tmplFilename), 'utf8');
      result.ejsTemplate = ejs.compile(result.mailEjsMjml);
      result.mailMjml = result.ejsTemplate({
        __rootPath: this.tmplBasePath,
        ...ejsParams,
      });
      result.transpileResult = mjml(result.mailMjml, mjmlOprions);
      result.mailHtml = result.transpileResult.html;
    } catch (error) {
      result.error = error;
    }

    return result;
  }

  createTestAccount(){
    if(this.testAccount){
      return Promise.resolve(this.testAccount);
    }
    return new Promise((resolve, reject) => {
      // Generate test SMTP service account from ethereal.email
      // Only needed if you don't have a real mail account for testing
      nodemailer.createTestAccount((err, account) => {
        if(err){
          return reject(err);
        }
        this.testAccount = account;
        return resolve(this.testAccount);
      });
    });
  }

  createTransporter(config){
    if(config === 'test'){
      if(this.testTransporter){
        return Promise.resolve(this.testTransporter);
      }
      return this.createTestAccount()
      .then(account => {
        // create reusable transporter object using the default SMTP transport
        this.testTransporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: account.user, // generated ethereal user
            pass: account.pass, // generated ethereal password
          },
        });
        return Promise.resolve(this.testTransporter);
      });
    }else{
      return Promise.resolve(nodemailer.createTransport(config));
    }
  }
}

AzMailer.ejs = ejs;
AzMailer.mjml = mjml;
AzMailer.nodemailer = nodemailer;
