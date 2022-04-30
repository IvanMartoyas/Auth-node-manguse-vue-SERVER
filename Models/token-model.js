const {Schema, model} = require('mongoose');

const TokenShema = new Schema({

    //Shema.Types.ObjextId связываю коллекции по id, и через  ref: 'user' указываю нужную мне коллекцию
    user: {type: Schema.Types.ObjectId, ref: 'User'},// подтверждена ли почта, 
    refreshToken: {type: String, required: true}// ссылка на активацию почты 
})

module.exports = model("Token",TokenShema)