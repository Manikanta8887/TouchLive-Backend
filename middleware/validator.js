import { validationResult, body, param } from "express-validator";

/**
 * Middleware to check validation results and return formatted error response.
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({ field: err.path, msg: err.msg })),
    });
  }
  next();
};

export const validateUserSave = [
  body("uid").notEmpty().withMessage("User UID is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("name").notEmpty().withMessage("Name is required"),
  handleValidationErrors,
];

export const validateProfileUpdate = [
  param("uid").notEmpty().withMessage("UID param is required"),
  body("bio").optional().isString().withMessage("Bio must be a string"),
  body("profilePic").optional().isString().withMessage("ProfilePic must be a valid URL/string"),
  handleValidationErrors,
];

export const validateVideoUpload = [
  param("uid").notEmpty().withMessage("UID param is required"),
  body("title").optional().isString().trim(),
  handleValidationErrors,
];
