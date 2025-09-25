const Joi = require('joi');

const validationSchemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
    role: Joi.string().valid('buyer', 'seller', 'both').default('buyer')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  information: Joi.object({
    title: Joi.string().max(200).required(),
    description: Joi.string().max(2000).required(),
    category: Joi.string().required(),
    price: Joi.number().positive().required(),
    tags: Joi.array().items(Joi.string()).optional(),
    isPrivate: Joi.boolean().default(false)
  }),

  trade: Joi.object({
    informationId: Joi.string().required(),
    message: Joi.string().max(500).optional()
  }),

  updateProfile: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).optional(),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
    avatar: Joi.string().uri().optional(),
    bio: Joi.string().max(500).optional()
  })
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        error: error.details[0].message
      });
    }
    next();
  };
};

module.exports = {
  validationSchemas,
  validate
};