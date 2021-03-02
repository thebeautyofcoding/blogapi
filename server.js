const express = require('express')
const path = require('path')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const InitiateMongoServer = require("./database/database");
const cookieParser = require('cookie-parser')
const registerRoutes = require('./routes/registerRoutes')
const loginRoutes = require('./routes/loginRoutes')
const cors = require('cors');
const { check, validationResult } = require('express-validator')
const blogRoutes = require('./routes/blogRoutes')
const authRoutes= require('./routes/authRoutes')
const tagRoutes = require('./routes/tagRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const preSignupRoute = require('./routes/preSignupRoute')
const userRoutes= require('./routes/userRoutes')
const signoutRoute = require('./routes/signoutRoute')

const contactRoutes=require('./routes/contactRoutes')
require('dotenv').config()
const multer = require('multer');
const { googleLogin } = require('./controllers/auth');
var upload = multer()
const app = express()
InitiateMongoServer()
app.use(cors({credentials: true, origin: true}))
app.options('*', cors());
app.use(express.json())
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(express.urlencoded({limit: '25mb',  parameterLimit: 100000,}));
app.use('/api', signoutRoute)
app.use(express.json({ limit: '200mb', extended: true }))

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });
// app.use(function (req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     next();});

app.use("/signup", upload.none(),

  registerRoutes)
app.use("/google-login", googleLogin)

app.use("/api/signin", upload.none(),
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({ min: 3 })
  ],
  loginRoutes)

  app.use('/api', authRoutes)
app.use('/api', preSignupRoute)
app.use('/api', categoryRoutes)
app.use('/api', tagRoutes)
app.use('/api', blogRoutes)
app.use('/api', userRoutes)
app.use('/api', contactRoutes)
app.use('/api',registerRoutes )


const PORT = process.env.PORT || 4000;

app.listen(PORT, (req, res) => {
  console.log(`Server Started at PORT ${PORT}`);
});
