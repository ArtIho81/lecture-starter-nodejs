import { USER } from "../models/user.js";
import { userService } from "../services/userService.js";
import { responseMiddleware } from "./response.middleware.js";

const valiadeValues = {
  email: "email",
  password: "password",
  phone: "phone",
};

const checkUniqueValue = (field, value, id) => {
  const isValueExist = userService.search({ [field]: value.toLowerCase() });
  const unique = !isValueExist || isValueExist.id === id
  return unique;
};
const validateEmail = (email) =>
  /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email.trim());
const validatePhone = (phone) => /^\+380[\d]{9}$/.test(phone.trim());
const validatePassword = (password) => password.trim().length >= 4;

const validateUniqueValue = (field, value, id) => {
let valid;
  if (field === valiadeValues.email) {
    valid = validateEmail(value);
  } else if (field === valiadeValues.phone) {
    valid = validatePhone(value);
  }
  if (!valid) {
    return `${field} isn't valid`;
  }
  const unique = checkUniqueValue(field, value, id);
  if (!unique) {
    return `${field} already exist`;
  }
  return null;
};

const isEmpty = (data) => data?.length;

const createUserValid = (req, res, next) => {
  // TODO: Implement validatior for USER entity during creation
  const candidate = req.body;
  const errors = [];

  Object.keys(USER).forEach((field) => {
    if (field !== "id" && !isEmpty(candidate[field])) {
      errors.push(`${field} is required`);
    } else if (
      field === valiadeValues.password &&
      !validatePassword(candidate[field])
    ) {
      errors.push(`${field} isn't valid`);
    } else if (field === valiadeValues.email || field === valiadeValues.phone) {
      const error = validateUniqueValue(field, candidate[field]);
      if (error) {
        errors.push(error);
      }
    }
  });

  if ("id" in candidate) {
    errors.push("Id is present in the request body");
  }

  if (errors.length > 0) {
    res.err = errors;
    return responseMiddleware(req, res, next);
  }
  next();
};

const updateUserValid = (req, res, next) => {
  // TODO: Implement validatior for user entity during update
  const updatedData = req.body;
  const { id } = req.params;
  const user = userService.search({ id });
  if (!user) {
    res.err = new Error(`User wasn't found`);
    return responseMiddleware(req, res, next);
  }

  const errors = [];
  const updatedFields = Object.keys(USER).filter(
    (field) => field !== "id" && isEmpty(updatedData[field])
  );
  if (updatedFields.length === 0) {
    errors.push("No data to update");
  } else {
    updatedFields.forEach((update) => {
      if (
        update === valiadeValues.password &&
        !validatePassword(updatedData[update])
      ) {
        errors.push(`${field} isn't valid`);
      } else if (
        update === valiadeValues.email ||
        update === valiadeValues.phone
      ) {
        const error = validateUniqueValue(update, updatedData[update], id);
        if (error) {
          errors.push(error);
        }
      }
    });
  }
  if ("id" in updatedData) {
    errors.push("Id is present in the request body");
  }

  if (errors.length > 0) {
    res.err = errors;
    return responseMiddleware(req, res, next);
  }
  next();
};

export { createUserValid, updateUserValid };
