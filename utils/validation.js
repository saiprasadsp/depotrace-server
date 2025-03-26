import Joi from "@hapi/joi";

// Register validation
export const registerValidation = (data) => {
  const schema = Joi.object({
    firstname: Joi.string().min(2).required(),
    lastname: Joi.string().min(2).required(),
    username: Joi.string().min(2).required(),
    password: Joi.string().min(2).required(),
    organization: Joi.string().required(),
    role: Joi.string().required(),
    isActive: Joi.boolean(),
    occupation: Joi.string().min(2).required(),
    email: Joi.string().min(2).required().email(),
    phoneNumber: Joi.string().min(2).required(),
    city: Joi.string().min(2).required(),
    state: Joi.string().min(2),
    country: Joi.string().min(2).required()
  });

  return schema.validate(data);
};

// User edit validation
export const userEditValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(6).required(),
    email: Joi.string().min(6).required().email(),
    role: Joi.string().required(),
    isActive: Joi.boolean().required(),
    _id: Joi.string().required()
  });

  return schema.validate(data);
};

// Login validation
export const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required()
  });

  return schema.validate(data);
};

// token verifit validation
export const tokenValidation = (data) => {
  const schema = Joi.object({
    token: Joi.string().required(),
    email: Joi.string().min(6).required().email()
  });

  return schema.validate(data);
};

// token resend validation
export const ensureEmailValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).required().email()
  });

  return schema.validate(data);
};

// pasword reset validation
export const passwordResetValidation = (data) => {
  const schema = Joi.object({
    token: Joi.string().required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required()
  });

  return schema.validate(data);
};

// Password change validator
export const passwordChangeValidation = (data) => {
  const schema = Joi.object({
    oldPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).required()
  });

  return schema.validate(data);
};


