const Joi = require('joi');
const SignupValidation = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'in'] } }).required(),
    name: Joi.string().required(),
    password: Joi.string().min(2).required()
});

const SignInValidation = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'in'] } }).required(),
    password: Joi.string().required()
});

const productValidationSchema = Joi.object({
    userid: Joi.string().required(),
    product_name: Joi.string().required(),
    product_category_id: Joi.string().required(),
    product_price: Joi.string().required()
});

const productDeleteValidationSchema = Joi.object({
    userid: Joi.string().required(),
    product_id: Joi.string().required()
});

module.exports = {
    SignupValidation,
    SignInValidation,
    productValidationSchema,
    productDeleteValidationSchema
}