const ApiError = require("../extantions/api-error")

// здесь описывается обрабодчик ошибок, 
/*
    когда я создаю новый энкземпляр класса ApiError сей код его перехватывает и вовзвращет статус код и текст ошибки
*/
module.exports = function (err, req, res, next) {
    console.log(err)
    if(err instanceof ApiError) {// если err это инстанс класса ApiError, значит оформляю ошипку с анными
        return res.status(err.status).json({message: err.message, errors: err.errors});
    }
    // если мне попалась неизвествная ошибка то считаем её поломкой сервера
    return res.status(500).json({message: "Непредвиденная ошибка."})
}
