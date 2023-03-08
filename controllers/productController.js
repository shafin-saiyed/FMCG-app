const express = require('express');
const mongoose = require('mongoose');
const { productValidationSchema,productDeleteValidationSchema } = require('../helper/validation');
const productSchema = require('../schema/productSchema')

module.exports.addProduct = async(req,res) => {
    try{
        const { userid, product_name, product_category_id, product_price,product_quantity } = req.body;
        const {error} = productValidationSchema.validate({ userid, product_name, product_category_id, product_price });
        if(error) return res.status(403).json({status: false, message: error.details[0].message});

        const product = await productSchema.findOne({ product_name, product_category_id, userid });
        if(product){
            return res.status(403).json({
                status: false,
                message: "Product Already Exist"
            })
        }
        const newProduct = await new productSchema({ userid, product_name, product_category_id, product_price,product_quantity }).save();
        return res.status(200).json({
            status:true,
            message: "Product added Successfully",
            data: newProduct
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({status: false, message: "Something Went Wrong"});
    }
}

module.exports.updateProduct = async(req,res) => {
    try{
        const { product_id, userid, product_name, product_category_id, product_price,product_quantity } = req.body;
        const {error} = productValidationSchema.validate({ userid, product_name, product_category_id, product_price });
        if(error) return res.status(403).json({status: false, message: error.details[0].message});

        const checkProductOwner = await productSchema.findOne({_id: product_id, userid});
        if(!checkProductOwner || checkProductOwner.length == 0 ) return res.status(403).json({status: false, message: "Invalid Request"});

        const updatedProduct = await productSchema.findByIdAndUpdate(product_id,{ product_name, product_category_id, product_price,product_quantity },{new: true});

        if(updatedProduct){
            return res.status(200).json({
                status:true,
                message: "Product updated Successfully",
                data: updatedProduct
            });
        } else {
            return res.status(404).json({
                status:true,
                message: "Product Not Found",
                data: []
            })
        }
    }
    catch(err){
        console.log(err);
        return res.status(500).json({status: false, message: "Something Went Wrong"});
    }
}

module.exports.deleteProduct = async(req,res) => {
    try{
        const { product_id, userid } = req.body;
        const {error} = productDeleteValidationSchema.validate({ userid, product_id });
        if(error) return res.status(403).json({status: false, message: error.details[0].message});

        const checkProductOwner = await productSchema.findOne({_id: product_id, userid});
        if(!checkProductOwner || checkProductOwner.length == 0 ) return res.status(403).json({status: false, message: "Invalid Request"});

        const product = await productSchema.findByIdAndDelete(product_id);

        if(product) {
            return res.status(200).json({
                status: true,
                message: "Product Deleted Successfully",
                data: product
            })
        } else {
            return res.status(404).json({
                status: false,
                message: "Product not Found",
            })
        }
    }
    catch(err){
        console.log(err);
        return res.status(500).json({status: false, message: "Something Went Wrong"});
    }
}

module.exports.getProductByUser = async(req,res) => {
    try{
        const { userid } = req.params;
        const pipeline = [
            {
                $match: {
                    userid: new mongoose.Types.ObjectId(userid)
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "product_category_id",
                    foreignField: "_id",
                    as: "product_category_details"
                }
            }
        ];

        const products = await productSchema.aggregate(pipeline);

        if(products && products.length > 0) {
            return res.status(200).json({
                status:true,
                message: "Products Found Successfully",
                data: products
            })
        } else {
            return res.status(404).json({
                status: false,
                message: "Product not Found",
            })
        }
    }
    catch(err){
        console.log(err);
        return res.status(500).json({status: false, message: "Something Went Wrong"});
    }
}

module.exports.getAllProducts = async (req,res)=>{
    try{
        const { product_category_id, min_price, max_price, product_name, page = 1, page_size=10 } = req.body;
        const offset = (parseInt(page) - 1) * parseInt(page_size);
        const query = {};
        if(product_category_id){
            query.product_category_id = new mongoose.Types.ObjectId(product_category_id)
        }
        if(product_name){
            query.product_name = {
                $regex: new RegExp(product_name, "i") 
            }
        }
        query.product_price = { 
            $lte: max_price || 1000000000, $gte: min_price || 0 
        };

        const pipeline = [
            {
                $match: query
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "product_category_id",
                    foreignField: "_id",
                    as: "product_category_details"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userid",
                    foreignField: "_id",
                    as: "user_details"
                }
            },
            {
                $project: {
                    __v:0,
                    category_details:{
                        _id:0
                    },
                    user_details: {
                        password: 0,
                        role: 0,
                        _id: 0,
                        __v:0
                    }
                }
            },
            { $skip: parseInt(offset) }, 
            { $limit: parseInt(page_size) }
        ];

        const products = await productSchema.aggregate(pipeline);

        if(products && products.length > 0) {
            return res.status(200).json({
                status:true,
                message: "Products Found Successfully",
                data: products
            })
        } else {
            return res.status(404).json({
                status: false,
                message: "Product not Found",
                data:[]
            })
        }
    }
    catch(err){
        console.log(err);
        return res.status(500).json({status: false, message: "Something Went Wrong"});
    }
};