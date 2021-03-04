const sgMail = require('@sendgrid/mail');

const User = require('../models/user');

sgMail.setApiKey(process.env.SG_API_KEY)
exports.contactForm = async(req, res) => {

    const { email, name, message } = req.body;
    const registeredUser = await User.findOne({ email })
    
    if(!registeredUser)return res.status(400).json({error:'Please only message users who are registered on this platform'})
    const emailData = {
        to: email,
        from: 'contact@writingislove.net',
        subject: `Contact form - ${process.env.APP_NAME}`,
        text: `Email received from ${name} \n with email: ${email} \n and message: ${message} `,
        html: 
                `
            <h4>
            Email received from contact form:</h4>
            <p>Sender name: ${name}</p>
            <p>Sender email: ${email}</p>
            <p>Sender message: ${message}</p>
        `
    }

    sgMail.send(emailData).then(sent => {
      
       
   
        return res.status(200).json({success:'true'})
    }).catch(err=>res.status(400).json({err}))
}


exports.contactBlogAuthForm = async(req, res) => {

    const { email, name, message, authorEmail } = req.body;
    const registeredUser = await User.findOne({ email })
    if (!registeredUser) return res.status(400).json({ error: "You must be registered on this platform in order to message the author of this blog post" })
    
    if(registeredUser.name !== name)return res.status(400).json({error:'Username does not belong to this email address.'})
    const mailList=[authorEmail]
    const emailData = {
        to: mailList,
        from: 'contact@writingislove.net',
        subject: `Contact form - ${process.env.APP_NAME}`,
        text: `Email received from ${name} \n with email: ${email} \n and message: ${message} `,
        html: 
                `
            <h4>
            Email received from contact form:</h4>
            <p>Sender name: ${name}</p>
            <p>Sender email: ${email}</p>
            <p>Sender message: ${message}</p>
        `
    }
    sgMail.send(emailData).then(() => {
        return res.status(200).json({ success: 'true' })
            
    //         .catch(res.status(400).json({ error: 'Oopsie, something failed so hard' }))
    // 
        })
    
}