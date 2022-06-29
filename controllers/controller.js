const userDetail = require('../models/userDetails')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')


function handleErrors(err){
    console.log(err.message)
    let errors = {email: " ", password: " "}
    if(err.message==="This email is not registered"){
        errors.email = "This email is not registered"
    }
    if(err.message==="The password is incorrect"){
        errors.password = "The password is incorrect"
    }
    
    if(err.message==="Cannot read properties of undefined (reading 'id')"){
        errors.email = "This email or account number is not registered"
    }
   
    if(err.code===11000){
        errors.email = "Email has been registered"
        return errors
    }
     if(err.message.includes('userDetails validation failed')){
        Object.values(err.errors).forEach(error=>{
           errors[error.properties.path] = error.properties.message
        })
    }
    return errors;
}

function generateAccountNumber(){
    let prefix = Date.now()
    function getRandomArbitrary(min, max) {
        return Math.floor(Math.random() * (max - min));
    }
    const randomNum = getRandomArbitrary(10, 99)
    let newDate = prefix.toString().slice(0,-1)
    Number(newDate)
    return newDate
}
function createToken(id){
    return jwt.sign({id}, process.env.JSON_SECRET_KEY, {expiresIn: 15 * 60 * 60})

}

function verifyToken(token){
    let payload
    if(token){
        jwt.verify(token, process.env.JSON_SECRET_KEY, (err, decodedToken)=>{
          if(err){
           console.log(err)
          }else{
           payload = decodedToken 
          }
        });
    }
    return payload
}
module.exports.signUp_get = (req, res) =>{
    res.send("signUp is here")
}

module.exports.signUp_post = async (req, res)=>{
    const accountNumber = generateAccountNumber()
    const { fullname, email, password } = req.body 
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)
    let credits = 0, debits = 0, accountBalance = 0 
    const newUser = new userDetail({
        fullname:req.body.fullname,
        email:req.body.email,
        password:hashedPassword,
        accountNumber:accountNumber,
        accountBalance:accountBalance,
        credits:credits,
        debits:debits
    })
    try{
        const user = await newUser.save()
        const token = createToken(user.id)
        res.cookie('use', token, {maxAge: 15*10*1000})
        res.status(201).json({user})
    }
    catch(err){
      const error = handleErrors(err)
      res.status(404).json({error})
    }
}

module.exports.loginIn_get = (req, res)=>{

}


module.exports.loginIn_post = async (req, res)=>{
    const { email, password } = req.body
    
    try{
        const user = await userDetail.login(email, password)
        const token = createToken(user.id)
        res.cookie("use", token, {expiresIn: 3* 24 * 60 * 60 * 1000})
        res.status(201).json({user})
    }
    catch(err){
        const error = handleErrors(err)
        res.status(404).json({error})
    }



}

module.exports.homePage_get = (req, res)=>{

}
module.exports.deposit_post  = async (req, res)=>{
    console.log(req.body.amountDeposited)
    let amountDeposited = Number(req.body.amountDeposited)
    let email = req.body.email 
    let accountNumber = req.body.accountNumber
    async function findUser(email, accountNumber){
        let user
        if(email){
          user = await userDetail.findOne({email})
        }else{
          user = await userDetail.findOne({accountNumber})
        }
       return user
    }
    try
    {
      req.user = await findUser(email, accountNumber)
      let user = req.user 
      console.log(user.accountBalance)
      console.log(amountDeposited)
      user.accountBalance = user.accountBalance + amountDeposited
      user.credits = user.credits + amountDeposited
      const updatedUser = await user.save()
      res.status(201).json({updatedUser})
    }
    catch(err){ 
        const error = handleErrors(err)
        res.status(404).json({error})
    }
}


module.exports.tranfer_post = async (req, res)=>{
    /*Get all the required parameters. Token, verified token, amountTransfered, 
    email and account from the request body*/
    let token = req.cookies.use
    const senderPayload = verifyToken(token)
    let amountTransfer = Number(req.body.amountTransfer)
    let email = req.body.email 
    let accountNumber = req.body.accountNumber
    //Verify if the senderdetail is an email or an account number 
     async function findUser(email, accountNumber){
        let user
        if(email){
          user = await userDetail.findOne({email})
        }else{
          user = await userDetail.findOne({accountNumber})
        }
       return user
    }

  

    try{
      req.sender = await userDetail.findById(senderPayload.id)
      let sender =  req.sender
      console.log(typeof(sender.accountBalance)) 
      sender.accountBalance = Number(sender.accountBalance) - amountTransfer
      if(sender.accountBalance < 0 ){
      throw Error("insuffient Balance")
      }else{
      //updating the account of the sender
      sender.debits = Number(sender.debits) + amountTransfer
      //updating the account of the receiver 
      req.reciever = await findUser(email, accountNumber)
      let reciever = req.reciever
      reciever.accountBalance = Number(reciever.accountBalance) + amountTransfer
      reciever.credits = Number(reciever.credits) + amountTransfer
      //saving the sender and the receiver 
      await reciever.save()
      const updatedSender = await sender.save()
      res.status(201).json({updatedSender})
      }

    }
    catch(err){
        const error = handleErrors(err)
        res.status(404).json({error})
    }

}

    



module.exports.withdraw_post = (req, res)=>{

}
module.exports.logOut_get =(req, res)=>{
    res.cookie('use', " ", {maxAge:1})
    res.send("Goodbye, hope to see you sonn")
}