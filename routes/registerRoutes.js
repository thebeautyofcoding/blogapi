const express = require("express");
const router = express.Router();
const { check, validationResult} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const shortId = require('shortid')

const User = require("../models/user");
const { errorHandler } = require("../controllers/dbErrorHandler");
const { preSignup } = require("../controllers/auth");

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */



router.post(
    "/signup",
    // [
    //     check("name", "Please Enter a Valid Name")
    //     .not()
    //     .isEmpty(),
    //     check("email", "Please enter a valid email").isEmail(),
    //     check("password", "Please enter a valid password").isLength({
    //         min: 6
    //     })
    // ],
     (req, res) => {
        const token = req.body.token;
        if (token) {
            jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, async (err, decoded) => {
                if (err) {
                    console.log(err)
                    return res.status(400).json({ error: 'Expired link. Signup again' })
                } else {
                    const { name, email, password } = jwt.decode(token);
                    const username= shortId.generate()
                    const profile = `${process.env.CLIENT_URL}/profile/${username}`
                    const user = new User({ name, email, password, profile, username })

                    await user.save((err, data) => {
                        if (err) {
                            console.log(err)
                            return res.json({
                                error: errorHandler(err)
                            })
                        }
                        console.log('69', data)
                        return res.status(201).json({
                            message: 'Register success! Please sign in',
                            user: data
                        })
                    })
                
                    
                }
            })
        } else {
            return res.status(400).json({
                message: 'Something went wrong'
            })
        }
     
       
    })

        
    



            // const payload = {
            //     user: {
            //         id: user._id
            //     }
            // };

            // jwt.sign(
            //     payload,
            //     "randomString", {
            //         expiresIn: 10000
            //     },
            //     (err, token) => {
            //         if (err) throw err;
            //         res.status(200).json({
            //             token
            //         });
            //     }
            // );
           
         
        



module.exports = router;
