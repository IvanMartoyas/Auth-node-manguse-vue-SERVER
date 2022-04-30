const ApiError = require("../extantions/api-error");
const tokenService = require("../Service/token-service");

module.exports = function (req, res, next) {
    try {
        
        const authorizationHeader = req.headers.authorization;
        // console.log("req.headers.authorization ",authorizationHeader)
        
        if(!authorizationHeader) { // если заголовка нет
            return next(ApiError.UnauthorizedError()); 
        }

        const accessToken = authorizationHeader.split(' ')[1];
        if(!accessToken) {
            return next(ApiError.UnauthorizedError());
        }

        const userData = tokenService.validateAccesssToken(accessToken);

        if(!userData) {// если в validateAccesssToken будет ошибка то там я указывал чтобы функция вернула null
            return next(ApiError.UnauthorizedError());
        }

        // если всё ок то возвращаю данные пользователя
        req.user = userData;
        next();
    } catch (error) {
        return next(ApiError.UnauthorizedError())
    }
}