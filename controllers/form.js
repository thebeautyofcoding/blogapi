const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SG_API_KEY)
exports.contactForm = (req, res) => {

    const { email, name, message } = req.body;
    
    const emailData = {
        to: process.env.EMAIL_TO,
        from: email,
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
      console.log('22it is running')
    sgMail.send(emailData).then(sent => {
        console.log('24it is running')
   
        return res.status(200).json({success:'true'})
    }).catch(err=>console.log(err))
    
}


exports.contactBlogAuthForm = (req, res) => {

    const { email, name, message, authEmail } = req.body;
    
    const mailList=[process.env.EMAIL_TO, authEmail]
    const emailData = {
        to: mailList,
        from: email,
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