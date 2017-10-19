var dotenv = require('dotenv');
dotenv.config();
var oauth2Controller = require('./controllers/oauth2');
var session = require('express-session');
var ejs = require('ejs');
var express = require('express');
var passport = require('passport');
var authController = require('./controllers/auth');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var userController = require('./controllers/user');
var clientController = require('./controllers/client');
var fileItemController = require('./controllers/fileitem');
var port = process.env.PORT || 3000;
var mongoConnectString = process.env.MONGODB_CONNECT_STRING || 'mongodb://localhost:27017/education_social_network';
mongoose.connect(mongoConnectString, {
        useMongoClient: true
});
var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
        extended: true
}));

// Use express session support since OAuth2orize requires it
app.use(session({
        secret: 'Super Secret Session Key',
        saveUninitialized: true,
        resave: true
}));

app.use(passport.initialize());

var router = express.Router();
var fileRouter = express.Router();
var port = process.env.PORT || 3000;
/*---------------------------------------------*/
router.route('/')
        .get(function (req, res) {
                res.json({ message: 'API Service Running!' });
        });
/*---------------------------------------------*/
router.route('/users')
        .post(userController.postUsers)
        .get(authController.isAuthenticated, userController.getUsers);
/*---------------------------------------------*/
router.route('/clients')
        .post(authController.isAuthenticated, clientController.postClients)
        .get(authController.isAuthenticated, clientController.getClients);
/*--------------------------------------------*/
// Create endpoint handlers for oauth2 authorize
router.route('/oauth2/authorize')
        .get(authController.isAuthenticated, oauth2Controller.authorization)
        .post(authController.isAuthenticated, oauth2Controller.decision);
// Create endpoint handlers for oauth2 token
router.route('/oauth2/token')
        .post(authController.isClientAuthenticated, oauth2Controller.token);
/*--------------------------------------------*/
fileRouter.route('/upload')
        .post(fileItemController.fileUpload, fileItemController.postFile);
fileRouter.route('/:file_id')
        .get(fileItemController.getFile)
        .delete(fileItemController.deleteFile);
fileRouter.route('/image')
        .post(fileItemController.imageUpload, fileItemController.postImage);
fileRouter.route('/info/:file_id')
        .get(fileItemController.getInfoFile);

/*--------------------------------------------*/
app.use('/api', router);
app.use('/files', fileRouter);
app.listen(port);
console.log('Running at ' + port);