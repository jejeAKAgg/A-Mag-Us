let mailer = require('nodemailer');

class Mail{
    constructor(){
        this.transporter = mailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'amagus.contact@gmail.com',
                pass: 'Am4gUs%$'
            }
        });
        this.options = {
            from: 'amagus.contact@gmail.com',
            to: undefined,
            subject: undefined,
            text: undefined,
        };
    }

    setOptions(mail, subject, content){
        this.options.to = mail;
        this.options.subject = subject;
        this.options.text = content;
    }

    send(mail, subject, content){
        this.setOptions(mail, subject, content);
        this.transporter.sendMail(this.options, (err)=>{
            if(err) throw err;
        });
    }
}

module.exports = Mail;