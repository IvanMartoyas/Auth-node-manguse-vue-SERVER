const Router = require('express').Router;
const AuthController = require('../Controllers/Auth-Controller');
const router = new Router();
const {body} = require("express-validator");// валидатор
//валидатор обрабатывается далее в контролере через validationResult

const authMiddlewares = require("../middlewares/auth-middlewares");

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min: 4,max: 8}),
    AuthController.registration
);
router.post('/login',AuthController.login);
router.post('/logout',AuthController.logout);
router.get('/activate/:link',AuthController.activate);
router.get('/refresh',AuthController.refresh);
router.get('/users', authMiddlewares, AuthController.getUsers);

module.exports = router;