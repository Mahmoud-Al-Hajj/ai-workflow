import { body, param, validationResult } from "express-validator";

export const validateCreateWorkflow = [
  body("description")
    .isString()
    .notEmpty()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
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
  // Format only. Uniqueness is a domain invariant and lives in AuthService.
  body("email").isEmail().notEmpty(),
  body("password")
    .isString()
    .withMessage("password must be a string")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 12, max: 100 })
    .withMessage("password must be between 12 and 100 characters long"),
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
