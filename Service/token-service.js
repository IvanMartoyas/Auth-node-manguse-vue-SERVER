const jwt = require('jsonwebtoken');
const tokenModel = require('../Models/token-model');

class TokenService {
    generateTokens(payload) {
        // 30 мин
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '15m'})// expiresIn время действия действия токена 
        // 30 дней
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'});

        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId, refreshToken) {// сохраняет токен в БД
        const tokenData = await tokenModel.findOne({user: userId});

        if(tokenData) {// если пользователь уже в бд существует
            tokenData.refreshToken = refreshToken;
            return tokenData.save();// возвращаю токен
        }

        // если пользователь логинеться в первый раз
        const token = await tokenModel.create({user: userId, refreshToken});

        return token;// возвращаю токен
    }

    async removeToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({refreshToken});// найд1т и удалит документ(запись) с токеном 
        return tokenData;
    }

    validateAccesssToken(token) {
        try {
            const userData =  jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        } catch (error) {
            return null;
        }
    }
    validateRefreshToken(token) {
        try {
            const userData =  jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        } catch (error) {
            return null;
        }
    }

    async findToken(refreshToken) {
        const tokenData = await tokenModel.findOne({refreshToken});
        return tokenData;
    }
}

module.exports = new TokenService();