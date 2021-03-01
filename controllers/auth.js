const User = require('../models/user')
const shortId=require('shortid')
const expressJwt = require('express-jwt')
var jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail')
const Blog= require('../models/blog')
const {OAuth2Client} =require('google-auth-library') 
const _ = require('lodash')
require('dotenv').config()
sgMail.setApiKey(process.env.SG_API_KEY)


exports.preSignup = async (req, res) => {
    const { name, email, password } = req.body
    
    
    const user = await User.findOne({ email: email.toLowerCase() }).catch(err => res.status(500).json({ error: 'Something went wrong' }))
    if (user) return res.status(400).json({ error: 'Email is already taken!' })
    


    const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' })
    console.log('19', token)

    if (name && name.length < 3) {
        return res.status(400).json({error:'Pls provide a name with at least 3 characters'})
    }

        if (!email) {
        return res.status(400).json({error:'Pls provide a valid email address'})
    }
            if (password && password.length < 6) {
        return res.status(400).json({error:'Pls provide a valid password with at least 6 characters'})
    }
    const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Account activation link`,
        html: `
            <h4>Email received from contact form: </h4>

            <p>Please use the following link to activate your account:</p>
            <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
            <hr/>
            <p>This email may contain sensitive information</p>
           
        
        `
    }

    sgMail.send(emailData).then(() => {
 
         res.status(200).json({ message: `Email has ben sent to ${email}. Follow the instructions to active your account` })
    }).catch(err => {
    
        res.status(400).json({ error: err.message, message: 'failed so hard' })
    }
    )
}
exports.requireSignin =  expressJwt({secret: process.env.JWT_SECRET,
    algorithms:['sha1', 'RS256', 'HS256']
    })


 
  

exports.adminMiddleware = async (req, res, next) => {
    let adminId;
    if(req.user && req.user._id) adminId = req.user._id
    if( req.user && req.user.user) adminId = req.user.user._id;
  
    const user = await User.findById({_id: adminId}).catch(err=> res.status(400).json({error:'User not found'}))
    if (user.role != 1) return res.status(400).json({ error: 'Admin resource. Acess denied' })
    req.profile = user;
    next()
}

exports.validateToken = (req, res, next) => {
     console.log('60!!!', req.headers)
     const authHeader = req.headers['authorization']
     console.log('66', authHeader)
     const token = authHeader && authHeader.split(' ')[1];
        console.log('22toekn', token)
    if (token == null) return res.send(401).json({message:'hier stimmt etwas nicht'})
        console.log('70', token)
    jwt.verify(token, "randomString", (err, user) => {

        console.log("69!!", token)
        if (err) return res.sendStatus(403)
        req.user = user;
        console.log('72!!!', req.user)
        next()
    })
}


exports.signout = (req, res) => {
    res.clearCookie("token")
    res.json({
        message: "Signout success"
    })
}


exports.authorizedToUpdateAndDelete = async(req, res, next) => {

    const slug = req.params.slug.toLowerCase();

    console.log('97!!!', slug)
    const blog = await Blog.findOne({ slug }).catch(err => res.status(400).json({ error: err }))
    
    console.log('100!!!', blog)
    let authorizedUser = blog.postedBy._id.toString() === req.profile._id.toString()
    if (!authorizedUser) return res.status(400).json({
        error: "You are not authorized for this action"

        
    })
    next()
}

exports.authMiddleware = async (req, res, next) => {
    let authUserId
    if (req.user && req.user._id) {
      authUserId = req.user._id;
    }
    
  else if(req.user.user && req.user.user._id){
       authUserId=req.user.user._id
  }
    let user = await User.findById({ _id: authUserId }).catch(err => {
        
        console.log('114!!!', err)
        return res.status(400).json({
            error: 'User not found'
        
        })
    
    })
    req.profile = user;
    console.log('118', user)
    console.log('im running')
    next()
    

}

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    const userWhoForgotPassword = await User.findOne({ email }).catch(err => res.status(400).json({ error: 'Ooopsie, something went wrong' }))
    
    if(!userWhoForgotPassword)return res.status(400).json({error:'No user with corresponding email found'})
    const token = jwt.sign({ _id: userWhoForgotPassword._id }, process.env.JWT_RESET_PASSWORD, { expiresIn: '1d' })


    const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Here is your password reset link`,

        html: `<h4>
        Email received from contact form:</h4>
        
        <p>Please use the following link to reset your password:</p>
        <p><a>${process.env.CLIENT_URL}/auth/password/reset/${token}</a></p>
        <hr/>
        <hr/>


        `
    }


    
    await userWhoForgotPassword.updateOne({ resetPasswordLink: token }).catch(err => res.status(400).json({
        error:err
    }))

    userWhoForgotPassword.save().catch(err=>res.status(400).json({error:'Something went wrong...'}))
    sgMail.send(emailData).then(() => {
         console.log('164!!!')
        return res.status(200).json({
            message: `Email has been sent to ${email}. Follow the instructions to reset your password. Link will expire soon`
        })
    })
}


exports.resetPassword = async (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;
    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, (err, decoded) => {
            if (err) {
                console.log('180', err)
                return res.status(401).json({
                    error: 'Link has been expired'
                })
            }
               
            
        

            User.findOne({ resetPasswordLink: resetPasswordLink }, async (err, user) => {

                    console.log('191', user)
                if (err || !user) return res.status(400).json({
                    error: 'Oops, something went wrong...'
                })

                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                }
                user = _.extend(user, updatedFields)
                await user.save().catch(err => res.status(400).json({
                    error: err
                }))
   
       
                res.status(200).json({
                    message: `Well done mate! Now you can signin with your new password`
                })


            })
            
        
            
        }
    
        )
    }
}
    exports.googleLogin = async (req, res) => {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    
        const idToken = req.body.tokenId
    
        const response = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })

        let { email_verified, name, email, jti } = response.payload;
        console.log('name198', name)
        if (email_verified) {
            const { name } = response.payload;
            
            let user = await User.findOne({ email }).catch(err => { return res.status(400).json({ message: err }) })

            if (user) {
                const token = jwt.sign({ _id: user._id }, "randomString", { expiresIn: '1d' })
                res.cookie('token', token, { expiresIn: '1d' })
                const { _id, email, name, role, username } = user
           

                return res.status(200).json({
                    token, user: { _id, email, name, role, username }
                })
            } else {
                let username = shortId.generate();
                let profile = `${process.env.CLIENT_URL}/profile/${username}`
                console.log('211!!!', jti)
                let password = jti
                const { name, email } = response.payload;
                user = new User({ name, email, profile, username, password })
            
                const savedUser = await user.save().catch(err => {
                
                
                    res.status(400).json({
                        error: err
                    })
                })
                console.log('227user', savedUser)
                const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
            
                res.cookie('token', token, { expiresIn: '1d' })
            
                const { _id, role } = savedUser;

                return res.status(200).json({
                    token, user: { _id, email, name, role, username }
                })
            }
        
        }
    }
