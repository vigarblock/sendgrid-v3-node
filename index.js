var fs = require("fs");
const SendGridClient = require("./sendGridClient");
const EmailDomain = "your-email-domain";
const SendGridKey = "your-sendgrid-api-key";

const sendEmail = async () => {
  const client = new SendGridClient(EmailDomain, SendGridKey);

  const emailArgs = {
    fromName: "your-fromName",
    subject: "your-subject",
    replyTo: "your-replyto-email",
    emailType: "text",
    message: "Hello there!",
    attachments: []
  };

  const data = fs.createReadStream(
    "./Attachments/SendGridSampleAttachment.png"
  );
  emailArgs.attachments.push({ stream: data });

  client.send(emailArgs);
};

sendEmail();
