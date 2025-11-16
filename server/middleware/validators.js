/**
 * Input Validation Middleware
 * SECURITY FIX #9: Centralized validation for all endpoints
 */

const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  next();
};

/**
 * Validation rules for user registration
 */
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be 3-50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 8, max: 100 })
    .withMessage('Password must be 8-100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('first_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('First name must be at most 100 characters'),
  body('last_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Last name must be at most 100 characters'),
  body('role')
    .optional()
    .isIn(['citizen', 'municipality', 'utility', 'union_of_municipalities', 'super_admin'])
    .withMessage('Invalid role'),
  validate,
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

/**
 * Validation rules for creating a report
 */
const validateCreateReport = [
  body('title_en')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('English title must be 5-200 characters'),
  body('title_ar')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Arabic title must be 5-200 characters'),
  body('note_en')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('English description must be 10-2000 characters'),
  body('note_ar')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Arabic description must be 10-2000 characters'),
  body('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('municipality')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Municipality must be 2-100 characters'),
  body('category')
    .isIn([
      'infrastructure',
      'electricity_energy',
      'water_sanitation',
      'waste_environment',
      'public_safety',
      'public_spaces',
      'public_health',
      'urban_planning',
      'transportation',
      'emergencies',
      'transparency_services',
      'other_unknown',
    ])
    .withMessage('Invalid category'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Severity must be low, medium, or high'),
  body('photo_urls')
    .optional()
    .isArray()
    .withMessage('Photo URLs must be an array'),
  body('photo_urls.*')
    .optional()
    .isURL()
    .withMessage('Each photo URL must be a valid URL'),
  validate,
];

/**
 * Validation rules for updating a report
 */
const validateUpdateReport = [
  param('id')
    .isUUID()
    .withMessage('Invalid report ID'),
  body('status')
    .optional()
    .isIn(['new', 'received', 'in_progress', 'resolved'])
    .withMessage('Invalid status'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid severity'),
  body('assigned_to')
    .optional()
    .isUUID()
    .withMessage('Invalid user ID'),
  validate,
];

/**
 * Validation rules for creating a comment
 */
const validateCreateComment = [
  param('id')
    .isUUID()
    .withMessage('Invalid report ID'),
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be 1-1000 characters'),
  validate,
];

/**
 * Validation rules for UUID parameters
 */
const validateUuidParam = (paramName = 'id') => [
  param(paramName)
    .isUUID()
    .withMessage(`Invalid ${paramName}`),
  validate,
];

/**
 * Validation rules for pagination
 */
const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative')
    .toInt(),
  validate,
];

module.exports = {
  validate,
  validateRegistration,
  validateLogin,
  validateCreateReport,
  validateUpdateReport,
  validateCreateComment,
  validateUuidParam,
  validatePagination,
};
