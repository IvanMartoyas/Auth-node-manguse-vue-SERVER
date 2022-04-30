const nodemailer = require('nodemailer')// плагин отправки писем

class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({ // transporter  по сути это начальная конфигурация плагина для отправки данных
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // true если я использую ssl, тогда там будет уже другой порт
            auth: {
              user: process.env.SMTP_USER, // generated ethereal user
              pass: process.env.SMTP_PASSWORD, // generated ethereal password
            },
        });

    }

    async sendActivationMail(to, link) {

        await this.transporter.sendMail({
            from: process.env.SMTP_USER, // указываю адрес отправителя (свой логин с которого отправляю)
            to, // кому отправить письмо, в данном случае это логин юзера 
            subject: "Активация аккаунта на " + process.env.API_URL, // API_URL домен сайта, когда поменяю на настоящий поменяю его в файле .env
            text: "", // контент не вкладдываю в письмо
            html: `
                <h1>Для активации перейдите по ссылке:</h1>
                <a href="${link}">${link}</a>
            `, // в качестве содержимого письма отправляю html 
        });

    }
}

module.exports = new MailService();