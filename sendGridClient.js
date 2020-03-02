const sgMail = require('@sendgrid/mail');
const { Mail, Attachment } = require('@sendgrid/helpers/classes');
const _ = require('lodash');

class SendGridClient {
  constructor(emailDoman, apiKey) {
    if (!emailDoman) {
      throw new Error('Email domain is required');
    }

    this.emailDomain = emailDoman;

    if (!apiKey) {
      throw new Error('SendGrid API key is required');
    }

    sgMail.setApiKey(this.apiKey);
  }

  /**
   *
   * Send an email using SendGrid's V3 library
   *
   * @param  {Object} args arguments for constructing the email
   */
  async send(args) {
    const mail = new Mail();
    mail.setFrom({ email: `simple-sendgrid-test@${this.emailDomain}`, name: args.fromName });
    mail.setSubject(args.subject);
    mail.setReplyTo({ email: args.replyTo });

    if (args.emailType === 'html') {
      mail.addHtmlContent(args.message);
    } else {
      mail.addTextContent(args.message);
    }

    if (Array.isArray(args.attachments)) {
      for (let i = 0; i < args.attachments.length; i++) {
        const attachment = args.attachments[i];
        const loadedAttachment = await this._loadAttachment(attachment);
        mail.addAttachment(loadedAttachment);
      }
    }

    try {
      const response = await sgMail.send(mail);
      return response;
    } catch (error) {
        console.log(error);
      throw error;
    }
  }

  async _loadAttachment(attachment) {
    return new Promise((resolve, reject) => {
      if (attachment.stream.isPaused()) {
        attachment.stream.resume();
      }

      const streamContent = [];

      attachment.stream.on('data', (chunk) => {
        streamContent.push(Buffer.from(chunk, 'binary'));
      });

      attachment.stream.on('error', (err) => {
        reject(err);
      });

      attachment.stream.on('end', async () => {
        try {
          const binary = Buffer.concat(streamContent);
          const content = binary.toString('base64');

          const tempAttachment = new Attachment();
          tempAttachment.setDisposition('attachment');
          tempAttachment.setFilename(attachment.name);
          tempAttachment.setContent(content);

          resolve(tempAttachment);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}

module.exports = SendGridClient;