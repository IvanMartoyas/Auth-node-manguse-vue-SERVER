// в рефреш токен мне надо записать данные пользователя, но модель мне возвращает полные данные юсера вместе см паролем
// который записать в payload для токена не безопастно, поэтому мне нужна промежуточная функция которая из обьекта с пользователем
// удалит пароль и оставит только его id, почтовый адрес и активирована ли почта
  
module.exports = class UserDto {
    email;
    id;
    isActivated;

    constructor(model) {
        this.email = model.email;
        this.id = model._id;
        this.isActivated = model.isActivated;
    }
}