import { body, param, validationResult } from "express-validator";
import { UserDBService } from "../services/database/userDBService.js";
const userDBService = new UserDBService();
export const validateCreateWorkflow = [
  body("description").isString().notEmpty(),
  body("n8nApiKey").isString().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
export const validateIdParam = [
  param("id").isInt(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateRegister = [
  body("name").isString().notEmpty().withMessage("name is required"),
  body("email")
    .isEmail()
    .notEmpty()
    .custom(async (value) => {
      const existingUser = await userDBService.getUserByEmail(value);
      if (existingUser) {
        throw new Error("A user already exists with this e-mail address");
      }
    }),
  body("password")
    .isString()
    .withMessage("password must be a string")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters long"),
  body("n8nUrl").isString().notEmpty(),
  body("n8nApiKey").notEmpty().withMessage("n8nApiKey is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("must be a valid email address")
    .notEmpty()
    .withMessage("email is required"),
  body("password").isString().notEmpty().withMessage("password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

//export const validateUpdateUser = [];
