const mongoose = require('mongoose')
const {isEmail, isStrongPassword} = require('validator')
const bcrypt = require('bcrypt')


const schema = mongoose.Schema

const userDetail = new schema({
    fullname: {
        type: String,
        required: [true, 'Please input your name']
        
    },
    email:{
        type:String,
        required:[true, 'Please provide an email'],
        unique:[true, 'This email has already been registered'],
        validate:[isEmail, 'Please provide a valid email']
    },
    password:{
        type: String,
        required: [true, "Please provide a password"],
        minlength:[8, "At least 8 characters"], 
        validate: [isStrongPassword,"At least 8 characters, 1 uppercase, 1 lowercase, 1 symbol"]
    }, 
    accountNumber:{
        type:Number, 
    },
    accountBalance:{
        type: Number
    },
    credits:{
        type:Number
    }, 
    debits:{
        type:Number
    }
}, {timestamps:true})


//login statics method 
userDetail.statics.login = async function(email, password){
  const user = await this.findOne({email})
  if(user){
    const verifiedpassword = await bcrypt.compare(password, user.password)
    if(verifiedpassword){
       return user
    }throw Error("The password is incorrect")

  }throw Error("This email is not registered")

}
const userModel = mongoose.model('customerdetail', userDetail)

module.exports = userModel