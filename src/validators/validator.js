// Import necessary modules for validation and error handling
import { body, validationResult } from "express-validator";
import { ErrorHandler } from "../errors/errorHandler.errors.js";
import { removeFile } from "../utils/cloudinary.utils.js";

// Validation rules for creating a post
export const createPostValidate = () => [
  // Validate 'content' field: it must not be empty and should be between 10 to 1000 characters
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Content must be at least 10 characters long"),
];

// Validation rules for user registration
export const registerUserValidate = () => [
  // Validate 'firstname': required and minimum 3 characters
  body("firstname")
    .notEmpty()
    .withMessage("Firstname is required")
    .isLength({ min: 3 })
    .withMessage("Firstname must be at least 3 characters long"),
  // Validate 'lastname': required and minimum 3 characters
  body("lastname")
    .notEmpty()
    .withMessage("Lastname is required")
    .isLength({ min: 3 })
    .withMessage("Lastname must be at least 3 characters long"),
  // Validate 'username': required and minimum 3 characters
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  // Validate 'email': required and must be in valid email format
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid"),
  // Validate 'password': required and minimum 6 characters
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  // Validate 'confirmPassword': required, minimum 6 characters, and must match 'password'
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .isLength({ min: 6 })
    .withMessage("Confirm Password must be at least 6 characters long")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Password and Confirm Password must be same"),
];

// Middleware to validate the result of previous validations
export const validateResult = async (req, res, next) => {
  try {
    // Check for validation errors
    const error = validationResult(req);
    if (error.array().length > 0) {
      // If errors exist, extract messages and handle the error
      const message = error
        .array()
        .map((err) => err.msg)
        .join(", ");
      await removeFile({ files: [req.file] }); // Remove uploaded file if validation fails
      return next(new ErrorHandler(message, 400)); // Pass error to the error handler
    } else {
      next(); // Proceed if no errors
    }
  } catch (error) {
    // Handle unexpected errors during validation
    await removeFile({ files: [req.file] }); // Remove uploaded file if an error occurs
    return next(
      new ErrorHandler(
        error?.message || "An error occurred during validation!",
        500
      )
    );
  }
};
