require('dotenv').config();
const express = require('express')
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config');
const cookieParser = require('cookie-parser')
const cors = require('cors')
const middlewareErrors = require('./middlewares/error-middlewares');


app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,// разрешаю куки
    origin: process.env.CLIENt_URL
}));

const PORT = process.env.PORT || 5000;
const BD_URL = process.env.BD_URL;

async function startServer() {
    try {
        await mongoose.connect(BD_URL,{ useNewUrlParser: true, useUnifiedTopology: true });// подлюкчение к бд

        app.listen(PORT, console.log("Server start on http://localhost:"+PORT+'/'));

    } catch(e) {
        console.log("Error for starting server: ", e )
    }
}

const routs = require("./Router/router");
app.use('/api/auth/', routs);
app.use(middlewareErrors);// обрабодчик ошибок должен быть последним в ципочки мдлвэеров, чтобы он корректно принимал ошибки

startServer();