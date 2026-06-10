import Joi from 'joi';
import mongoose from 'mongoose';
import { CONFIG } from '../config/constants.js';

export const patientValidationSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required()
    .min(CONFIG.VALIDATION.name.min)
    .max(CONFIG.VALIDATION.name.max)
    .messages({
      'string.min': `Patient name must be at least ${CONFIG.VALIDATION.name.min} characters`,
      'string.max': `Patient name must be at most ${CONFIG.VALIDATION.name.max} characters`,
      'any.required': 'Patient name is required'
    }),
  phone: Joi.string()
    .trim()
    .max(CONFIG.VALIDATION.phone.max)
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .allow('')
    .messages({
      'string.pattern.base': 'Phone number format is invalid'
    }),
  age: Joi.number()
    .integer()
    .min(CONFIG.VALIDATION.age.min)
    .max(CONFIG.VALIDATION.age.max)
    .allow(null, '')
    .messages({
      'number.min': `Age must be at least ${CONFIG.VALIDATION.age.min}`,
      'number.max': `Age must be at most ${CONFIG.VALIDATION.age.max}`
    }),
  reason: Joi.string()
    .trim()
    .max(CONFIG.VALIDATION.reason.max)
    .allow('')
    .messages({
      'string.max': `Reason must be at most ${CONFIG.VALIDATION.reason.max} characters`
    }),
  emergency: Joi.boolean().default(false)
});

export const mongoIdParamSchema = Joi.object({
  id: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }

      return value;
    })
    .required()
    .messages({
      'any.invalid': 'Invalid resource identifier',
      'any.required': 'Resource identifier is required'
    })
});

export const consultationMinutesSchema = Joi.object({
  consultationMinutes: Joi.number()
    .integer()
    .positive()
    .max(CONFIG.VALIDATION.consultation.max)
    .allow(null, '')
    .messages({
      'number.positive': `Consultation minutes must be greater than ${CONFIG.VALIDATION.consultation.min - 1}`,
      'number.max': `Consultation minutes cannot exceed ${CONFIG.VALIDATION.consultation.max} (24 hours)`
    })
});

export const staffLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string()
    .required()
    .min(CONFIG.VALIDATION.password.min)
    .messages({
      'string.min': `Password must be at least ${CONFIG.VALIDATION.password.min} characters`,
      'any.required': 'Password is required'
    })
});

export const staffRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .required()
    .min(CONFIG.VALIDATION.password.min)
    .max(CONFIG.VALIDATION.password.max),
  name: Joi.string()
    .required()
    .min(CONFIG.VALIDATION.name.min)
    .max(CONFIG.VALIDATION.name.max),
  role: Joi.string().valid('receptionist', 'doctor', 'admin').default('receptionist')
});

export function validateRequest(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => detail.message).join(', ');
      const err = new Error(messages);
      err.statusCode = 422;
      return next(err);
    }

    req.validatedBody = value;
    next();
  };
}

export function validateParams(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join(', ');
      const err = new Error(messages);
      err.statusCode = 422;
      return next(err);
    }

    req.params = value;
    next();
  };
}
