import Joi from 'joi';

export function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.details.map((d) => ({ field: d.path.join('.'), message: d.message }))
      });
    }
    req.body = value;
    next();
  };
}

export const schemas = {
  register: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).max(128).required(),
    fullName: Joi.string().min(2).max(100).required()
  }),
  login: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required()
  }),
  refresh: Joi.object({
    refreshToken: Joi.string().required()
  }),
  forgotPassword: Joi.object({
    email: Joi.string().email().lowercase().required()
  }),
  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required()
  }),
  updateProfile: Joi.object({
    fullName: Joi.string().min(2).max(100).required()
  }),
  updateMetrics: Joi.object({
    gender: Joi.string().valid('male', 'female', 'other').required(),
    birthDate: Joi.date().required(),
    heightCm: Joi.number().min(50).max(300).required(),
    weightKg: Joi.number().min(20).max(500).required(),
    goal: Joi.string().valid('lose', 'maintain', 'gain').required(),
    activityLevel: Joi.string().valid('sedentary','light','moderate','active','very_active').required(),
    dietaryPreferences: Joi.array().items(Joi.string()).default([]),
    allergies: Joi.array().items(Joi.string()).default([])
  })
  ,
  addWater: Joi.object({
    amountMl: Joi.number().integer().min(50).max(5000).required()
  }),
  addExercise: Joi.object({
    type: Joi.string().min(2).max(100).required(),
    durationMin: Joi.number().integer().min(1).max(600).required(),
    intensity: Joi.string().valid('low','medium','high').required()
  })
};
