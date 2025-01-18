import { body, validationResult } from "express-validator";
import { ErrorHandler } from "../errors/errorHandler.errors.js";

export const createPostValidate = () => [
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Content must be at least 10 characters long"),
];

export const registerUserValidate = () => [
  body("firstname")
    .notEmpty()
    .withMessage("Firstname is required")
    .isLength({ min: 3 })
    .withMessage("Firstname must be at least 3 characters long"),
  body("lastname")
    .notEmpty()
    .withMessage("Lastname is required")
    .isLength({ min: 3 })
    .withMessage("Lastname must be at least 3 characters long"),
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .isLength({ min: 6 })
    .withMessage("Confirm Password must be at least 6 characters long")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Password and Confirm Password must be same"),
];

export const validateResult = (req, res, next) => {
  try {
    const error = validationResult(req);
    if (error.array().length > 0) {
      const message = error
        .array()
        .map((err) => err.msg)
        .join(", ");
      return next(new ErrorHandler(message, 400));
    } else next();
  } catch (error) {
    return next(
      new ErrorHandler(
        error?.message || "We get error during validating the data !",
        500
      )
    );
  }
};
