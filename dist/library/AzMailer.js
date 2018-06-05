'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ejs = require('ejs');

var _ejs2 = _interopRequireDefault(_ejs);

var _mjml = require('mjml');

var _mjml2 = _interopRequireDefault(_mjml);

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AzMailer = function () {
  function AzMailer(tmplBasePath) {
    _classCallCheck(this, AzMailer);

    this.ejs = _ejs2.default;
    this.mjml = _mjml2.default;
    this.nodemailer = _nodemailer2.default;

    this.tmplBasePath = _path2.default.resolve(tmplBasePath || './');
    this.testAccount = null;
    this.testTransporter = null;
  }

  _createClass(AzMailer, [{
    key: 'renderMail',
    value: function renderMail(tmplFilename) {
      var ejsParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var mjmlOprions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var result = {};
      try {
        result.mailEjsMjml = _fs2.default.readFileSync(_path2.default.join(this.tmplBasePath, tmplFilename), 'utf8');
        result.ejsTemplate = _ejs2.default.compile(result.mailEjsMjml);
        result.mailMjml = result.ejsTemplate(_extends({
          __rootPath: this.tmplBasePath
        }, ejsParams));
        result.transpileResult = (0, _mjml2.default)(result.mailMjml, mjmlOprions);
        result.mailHtml = result.transpileResult.html;
      } catch (error) {
        result.error = error;
      }

      return result;
    }
  }, {
    key: 'createTestAccount',
    value: function createTestAccount() {
      var _this = this;

      if (this.testAccount) {
        return Promise.resolve(this.testAccount);
      }
      return new Promise(function (resolve, reject) {
        _nodemailer2.default.createTestAccount(function (err, account) {
          if (err) {
            return reject(err);
          }
          _this.testAccount = account;
          return resolve(_this.testAccount);
        });
      });
    }
  }, {
    key: 'createTransporter',
    value: function createTransporter(config) {
      var _this2 = this;

      if (config === 'test') {
        if (this.testTransporter) {
          return Promise.resolve(this.testTransporter);
        }
        return this.createTestAccount().then(function (account) {
          _this2.testTransporter = _nodemailer2.default.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: account.user,
              pass: account.pass }
          });
          return Promise.resolve(_this2.testTransporter);
        });
      } else {
        return Promise.resolve(_nodemailer2.default.createTransport(config));
      }
    }
  }]);

  return AzMailer;
}();

exports.default = AzMailer;


AzMailer.ejs = _ejs2.default;
AzMailer.mjml = _mjml2.default;
AzMailer.nodemailer = _nodemailer2.default;