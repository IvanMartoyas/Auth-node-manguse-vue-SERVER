const UserModel = require('../Models/user-model');
const bcrypt = require('bcrypt')// хеширование пароля
const uuid = require('uuid')// создание уникальной строки для ссылки почты
const mailService = require('../Service/mail-service');
const TokenService = require('../Service/token-service');
const UserDto = require('../dtos/user-dto');// класс 
const ApiError = require('../extantions/api-error');// клас обрабодчик ошибок
const tokenService = require('../Service/token-service');
const userModel = require('../Models/user-model');


class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({email});

        if(candidate) {// если есть уже ззарегистрированный пользователь с таким email (логином)
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        }

        const activationLink = uuid.v4();// создаю ссылку активации
        const hashPassword = await bcrypt.hash(password, 3); // хеширую пароль

        const user = await UserModel.create({ email, password: hashPassword, activationLink })// создаю пользователя

        await mailService.sendActivationMail(email, ` ${process.env.API_URL}api/auth/activate/${activationLink}`); // отправляю письмо для подтверждения почты

        const userDto = new UserDto(user)// UserDto удалит из получаемого user поле password т.к. сохранять его в токене не безопастно
        // generateTokens вернёт обьект с acess и refresh токенами
        const tokens = TokenService.generateTokens({...userDto});// поля класса userDto, станут полями обьекта входных пораметраметров для generateTokens
        
        await TokenService.saveToken(userDto.id, tokens.refreshToken);// сохраняю токен в бд

        return { // возвращаюо обьект пользователя и токены
            ...tokens,
            user: userDto
        }
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})// нахожу пользователя по ссылке в бд

        if(!user) { // если его в бд нет
            throw ApiError.BadRequest('Некорректная ссылка активации')
        }

        // если пользователь по ссылке нашолся, то isActivated = true и сохраняю данные в бд 
        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        const user = await UserModel.findOne({email}) // ищу пользователя по почте
        if(!user) {
            throw ApiError.BadRequest("Пользователь с таким паролем не найден.")
        }

        const isPassEquals = await bcrypt.compare(password, user.password)// сравниваю пароли

        if(!isPassEquals) {
            throw ApiError.BadRequest("Неверный пароль.")
        }

        // если всё ок, то надо удалить и полученного обьекта пользователя пароль через UserDto и снова сгенерировать токены и выслать их
        const userDto = new UserDto(user);

        const tokens = TokenService.generateTokens({...userDto});// поля класса userDto, станут полями обьекта входных пораметраметров для generateTokens
        
        await TokenService.saveToken(userDto.id, tokens.refreshToken);// сохраняю токен в бд

        return { // возвращаюо обьект пользователя и токены
            ...tokens,
            user: userDto
        }
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if(!refreshToken) {// если токена вообще нет
            throw ApiError.UnauthorizedError();
        }

        //валидация, возвращет расшифрованный токен по секретному ключу
        const userData = tokenService.validateRefreshToken(refreshToken);
        //поиск токена в базе
        const tokenFromDB = await tokenService.findToken(refreshToken);

        if(!userData || !tokenFromDB) { // и валидация и поиск токена в базе не прошли успешно
            throw ApiError.UnauthorizedError();
        }

        // так как рефрешь токен живёт долго пользователь мог поменять уже свои данные поэтому я нахожe его по id 
        // и записываю для себя данные 
        const user = await userModel.findById(userData.id); 

        // по новой собираю данные
        const userDto = new UserDto(user)

        const tokens = TokenService.generateTokens({...userDto});

        await TokenService.saveToken(userDto.id, tokens.refreshToken);

        return { // возвращаюо обьект пользователя и токены
            ...tokens,
            user: userDto
        }

    }

    async getAll() {
        const users = await UserModel.find();
        return users;
    }
}

module.exports = new UserService();



