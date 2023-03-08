const express = require('express');
const route = express.Router();
const bcrypt = require('bcrypt');
const userSchema = require('../schema/userSchema');
const {SignupValidation, SignInValidation} = require('../helper/validation');
const {generateToken} = require('../helper/jwt');
const roles = require('../helper/roles');

module.exports.signup = async (req,res) => {
    try{
        const { email, name, password } = req.body;
        const {error} = SignupValidation.validate({ email, name, password});
        if(error) return res.status(401).json({status: false, message: error.details[0].message});

        const user = await userSchema.findOne({ email });
        if(user){
            return res.status(201).json({
                status: false,
                message: "Email Already Exist"
            })
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = new userSchema({ email, password: hashedPassword, name, role: roles.customer });
        const accessToken = generateToken({userid: newUser._id, role: newUser.role});
        await newUser.save();
        return res.status(200).json({
            status:true,
            message: "Successfully Registered and LoggedIn",
            data: {email: newUser.email, name: newUser.name, role: newUser.role, userid: newUser._id},
            accessToken
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({status: false, message: "Something Went Wrong"});
    }
}

module.exports.signin = async(req,res) => {
    try{
        const { email, password } = req.body;
        const {error} = SignInValidation.validate({ email, password});
        if(error) return res.status(401).json({status: false, message: error.details[0].message});
        const user = await userSchema.findOne({ email });
        if(!user){
            return res.status(401).json({
                status:false,
                message: "User not Found",
            })
        } 
        const checkPassword = await bcrypt.compare(password,user.password);
        if(!checkPassword) {
            return res.status(401).json({
                status:false,
                message: "Invalid Password",
            })
        }
        const accessToken = generateToken({userid: user._id, role: user.role});
        //newUser.accessToken = accessToken;
        return res.status(200).json({
            status:true,
            message: "Signin Successfully",
            data: {email: user.email, name: user.name, role: user.role, userid: user._id},
            accessToken
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({status: false, message: "Something Went Wrong"});
    }
}

module.exports.getcustomerList = async(req,res) => {
    try {
        const customerList = await userSchema.find({role: roles.customer},{password:0});
        if(customerList.length > 0){
            return res.status(200).json({
                status: true,
                message: "Data Found",
                data: customerList
            });
        } else{
            return res.status(404).json({
                status: false,
                message: "Data not Found",
            })
        }
    } catch(err){
        console.log(err);
        return res.status(500).json({status: false, message: "Something Went Wrong"});
    }
}