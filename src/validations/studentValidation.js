
const Joi = require('joi').extend(require('@joi/date'));

const studentSchema = Joi.object({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    studentNumber: Joi.string().trim().required(),
    dateOfBirth: Joi.date().format('YYYY-MM-DD').raw().optional(),
    teacher: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    parent: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    grades: Joi.array().items(Joi.object({
        subject: Joi.string().required(),
        score: Joi.number().min(0).max(100).required(),
        date: Joi.date().optional()
    })).optional()
});

const updateStudentSchema = Joi.object({
   
    firstName: Joi.string().trim().optional(),
    lastName: Joi.string().trim().optional(),
    studentNumber: Joi.string().trim().optional(),
    dateOfBirth: Joi.date().format('YYYY-MM-DD').raw().optional(),
    teacher: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    parent: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    grades: Joi.array().items(Joi.object({
        subject: Joi.string().required(),
        score: Joi.number().min(0).max(100).required(),
        date: Joi.date().optional()
    })).optional()
}).min(1);

module.exports = {
    studentSchema,
    updateStudentSchema
};