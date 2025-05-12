import { FIGHTER } from "../models/fighter.js";
import { responseMiddleware } from "./response.middleware.js";
import { fighterService } from "../services/fighterService.js";

const validateValues = {
  name: "name",
  power: {
    value: "power",
    range: [1, 100],
  },
  defense: {
    value: "defense",
    range: [1, 10],
  },
  health: {
    value: "health",
    range: [80, 120],
  },
};

const checkUniqueValue = (field, value, id) => {
  const isValueExist = fighterService.search({ [field]: value.toLowerCase() });
  const unique = !isValueExist || isValueExist.id === id;
  return unique;
};

const isValueInRange = (value, min, max) => value >= min && value <= max;
const isEmpty = (data) => (typeof data === "number" ? true : data?.length);
const validatePower = (power) =>
  isValueInRange(power, ...validateValues.power.range);
const validateDefense = (defense) =>
  isValueInRange(defense, ...validateValues.defense.range);
const validateHealth = (health) =>
  !health || isValueInRange(health, ...validateValues.health.range);

const createFighterValid = (req, res, next) => {
  // TODO: Implement validatior for FIGHTER entity during creation
  const candidate = req.body;
  const errors = [];

  Object.keys(FIGHTER).forEach((field) => {
    if (
      field !== "id" &&
      field !== validateValues.health.value &&
      !isEmpty(candidate[field])
    ) {
      errors.push(`${field} is required`);
    } else if (field === validateValues.name) {
      const unique = checkUniqueValue(field, candidate[field]);
      if (!unique) {
        errors.push(`${field} already exist`);
      }
    } else if (
      (field === validateValues.power.value && !validatePower(candidate[field])) ||
      (field === validateValues.defense.value &&
        !validateDefense(candidate[field])) ||
      (field === validateValues.health.value && !validateHealth(candidate[field]))
    ) {
      errors.push(`${field} isn't valid`);
    }
  });

  if ("id" in candidate) {
    errors.push("Id in the request body is present");
  }

  if (errors.length > 0) {
    res.err = errors;
    return responseMiddleware(req, res, next);
  }
  next();
};

const updateFighterValid = (req, res, next) => {
  // TODO: Implement validatior for FIGHTER entity during update
  const updatedData = req.body;
  const { id } = req.params;
  const fighter = fighterService.search({ id });
  if (!fighter) {
    res.err = new Error(`Fighter wasn't found`);
    return responseMiddleware(req, res, next);
  }

  const errors = [];
  const updatedFieldsNumber = Object.keys(FIGHTER).filter(
    (field) => field !== "id" && isEmpty(updatedData[field])
  );
  if (updatedFieldsNumber.length === 0) {
    errors.push("No data to update");
  } else {
    updatedFieldsNumber.forEach((update) => {
      if (
        (update === validateValues.power.value &&
          !validatePower(updatedData[update])) ||
        (update === validateValues.defense.value &&
          !validateDefense(updatedData[update])) ||
        (update === validateValues.health.value &&
          !validateHealth(updatedData[update]))
      ) {
        errors.push(`${update} isn't valid`);
      } else if (update === validateValues.name) {
        const unique = checkUniqueValue(update, updatedData[update], id);
        if (!unique) {
          errors.push(`${update} already exist`);
        }
      }
    });
  }
  if ("id" in updatedData) {
    errors.push("Id in the request body is present");
  }
  if (errors.length > 0) {
    res.err = errors;
    return responseMiddleware(req, res, next);
  }
  next();
};

export { createFighterValid, updateFighterValid };
