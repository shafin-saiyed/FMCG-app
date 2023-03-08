const jwt = require('jsonwebtoken');
const userSchema = require('../schema/userSchema');
const roles = require('../helper/roles');
const mongoose = require('mongoose');

module.exports.generateToken = (data) =>{
    return jwt.sign(data, process.env.JWT_SECRET_KEY, {
        expiresIn: "30m"
    });
}

module.exports.userAuth = async(req,res,next) => {
    try {
        const req_userid = req.body.userid;
        const authHeader = req.headers["authorization"]
        const token = authHeader?.split(" ")[1] || null

        if (token) {
            jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decodedToken) => {
              if (err) {
                return res.status(401).json({ message: "Something wrong with token or Token Expired" })
              } else {
                if (!decodedToken || decodedToken.role !== roles.customer) {
                    return res.status(401).json({ message: "Not authorized" })
                } else {
                    const checkUser = await userSchema.findOne({_id: decodedToken.userid});
                    if(!checkUser) return res.status(401).json({ status: false, message: "User not found. Operation cancelled.", data: null });
                    if(req_userid === decodedToken.userid) return next()
                    return res.status(401).json({ status: false, message: "Invalid Request", data: null });
                }
              }
            })
          } else {
            return res
              .status(401)
              .json({ message: "Not authorized, token not available" })
          }
    }
    catch(err){
        console.log(err);
        return res.status(403).json({ status: false, message: "Something went Wrong", data: null });
    }
}

module.exports.adminAuth = async(req, res, next) => {
    try
    {
        const authHeader = req.headers["authorization"]
        const token = authHeader?.split(" ")[1] || null
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decodedToken) => {
                if (err) {
                    return res.status(401).json({ status:false, message: "Some thing wrong with token or Token Expired" })
                } else {
                    if (decodedToken.role !== roles.admin) {
                        return res.status(401).json({ status:false, message: "Not authorized" })
                    } else {
                        const checkUser = await userSchema.findOne({_id: decodedToken.userid});
                        if(!checkUser) return res.status(401).json({ status: false, message: "User not found. Operation cancelled.", data: null });
                        return next();
                    }
                }
            })
        } else {
        return res
            .status(401)
            .json({ status:false, message: "Not authorized, token not available" })
        }
    }
    catch(err){
        console.log(err);
        return res.status(403).json({ status: false, message: "Something went Wrong", data: null });
    }
  }