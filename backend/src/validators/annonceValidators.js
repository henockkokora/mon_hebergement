import { body, validationResult } from 'express-validator';

// Middleware pour gérer les erreurs de validation
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: errors.array()
    });
  }
  next();
};

// Validateur pour la création d'annonce
export const createAnnonceValidator = [
  body('titre')
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Le titre doit contenir entre 3 et 150 caractères'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('La description doit contenir entre 10 et 5000 caractères'),
  
  body('adresse')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('L\'adresse doit contenir entre 5 et 255 caractères'),
  
  body('ville')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('La ville doit contenir entre 2 et 120 caractères'),
  
  body('quartier')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Le quartier doit contenir entre 2 et 120 caractères'),
  
  body('type')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le type doit contenir entre 2 et 50 caractères'),
  
  body('prixParNuit')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Le prix doit être un nombre positif'),
  
  body('capacite')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La capacité doit être un entier positif'),
  
  body('photos')
    .optional()
    .isArray()
    .withMessage('Les photos doivent être un tableau'),
  
  body('videos')
    .optional()
    .isArray()
    .withMessage('Les vidéos doivent être un tableau'),
  
  handleValidationErrors
];

// Validateur pour la mise à jour d'annonce
export const updateAnnonceValidator = [
  body('titre')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Le titre doit contenir entre 3 et 150 caractères'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('La description doit contenir entre 10 et 5000 caractères'),
  
  body('prixParNuit')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Le prix doit être un nombre positif'),
  
  handleValidationErrors
];
