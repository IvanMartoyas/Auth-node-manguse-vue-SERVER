const {Schema, model} = require('mongoose');

const UserShema = new Schema({
    email: {type: String, uniqe: true, required: true},
    password: {type: String, required: true},
    isActivated: {type: Boolean, default: false},// подтверждена ли почта, 
    activationLink: {type: String}// ссылка на активацию почты 
})

module.exports = model("User",UserShema)