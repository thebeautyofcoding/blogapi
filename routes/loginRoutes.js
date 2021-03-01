const User = require('../models/user')
const express = require("express");
const { check, validationResult} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const {signout, validateToken}= require('../controllers/auth')
router.post(
    "/", 
    async (req, res) => {
        // const errors = validationResult(req);
        
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({
        //         errors: errors.array()
        //     });
        

        const { email, password } = req.body;

        if(password.length===0)return res.status(400).json({error:'Please type in the correct password'})
        try {
            const user = await User.findOne({ email })
         
            if (!user) { res.status(400).json({
                error: 'No user found with this email!'
            })
            } else {
               
                await bcrypt.compare(password, user.password, (err, result) => {
                    
                 
                if(err) {return res.status(400).json({
                error: "Incorrect Password!"
                })
                    }

                 const payload = {
                user: {
                    _id: user._id
                }
                    }
                    
                const {_id, username,name, email, role} = user
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
                if (err) throw err;
                res.cookie('token', token, { expiresIn: '1d' })
                res.status(200).json({
                    token,
                    user:{_id,username, name, email, role}
                })
            })
                     
            })
            }
        } catch (err) {
          
            res.status(500).json({
                message:'Server Error'
            })
        }

    }

);








module.exports = router;
