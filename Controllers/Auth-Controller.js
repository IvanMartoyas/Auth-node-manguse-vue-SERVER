const userService = require('../Service/user-service');
const {validationResult} = require('express-validator');// validationResult результаты валидации из роутера
const ApiError = require('../extantions/api-error')

class AuthController {
    async registration (req, res, next) {
        try {

            const errors = validationResult(req);

            if(!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при регистрации ', errors.array()))
            }
            const {email, password} = req.body;
            const userData = await userService.registration(email, password);

            // эта строка запишет куку сервером на клиент с refresh токеном, чтобы эта страка отработала нужно установить cookieParser и зарегать
            // его через app.use(cookieParser())
            // maxAge время жизни куки в милисекундах
            // httpOnly запрещает менять куку браузером
            res.cookie("refreshToken", userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})

            return res.json(userData);
        } catch (error) {
            //error-middlewares и api-error я реализовал прослойку по обработке ошибок, здесь как раз nex переведёт ошибку в инстанс api-error
            next(error);
        }
    }
    async login (req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.login(email,password);
            
            res.cookie("refreshToken", userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})

            return res.json(userData);
        } catch (error) {
            next(error);
        }
    }
    async logout (req, res, next) {
        try {
            // реализация простая, удаляю куку и токен хранящийся в БД
            const {refreshToken} = req.cookies; // достаю куку

            const token = await userService.logout(refreshToken);// передаю токен из кук

            res.clearCookie("refreshToken");// удаляю куку из браузера

            return res.json(200);
        } catch (error) {
           next(error);
        }
    }
    async activate (req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);

            res.redirect(process.env.CLIENt_URL);

        } catch (error) {
            next(error);
        }
    }
    async refresh (req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);// вернёт новую пару акцесс и рефреш токенов
            
            // задаю по нововй куку
            res.cookie("refreshToken", userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})

            return res.json(userData);
        } catch (error) {
            next(error);
        }
    }
    async getUsers (req, res, next) {
        try {
            const users = await userService.getAll();
            res.json(users);
        } catch (error) {
            next(error);
        }
    }


}

module.exports = new AuthController();