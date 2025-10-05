const Joi = require('joi');

// Schéma de validation pour les likes
const likeSchema = Joi.object({
  movieId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'L\'ID du film doit être un nombre',
      'number.integer': 'L\'ID du film doit être un entier',
      'number.positive': 'L\'ID du film doit être positif',
      'any.required': 'L\'ID du film est requis'
    }),
  isLiked: Joi.boolean().optional().default(true)
    .messages({
      'boolean.base': 'Le statut de like doit être un booléen'
    }),
  movieData: Joi.object().optional()
    .messages({
      'object.base': 'Les données du film doivent être un objet'
    })
});

// Schéma de validation pour les films
const movieSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'L\'ID du film doit être un nombre',
      'number.integer': 'L\'ID du film doit être un entier',
      'number.positive': 'L\'ID du film doit être positif',
      'any.required': 'L\'ID du film est requis'
    }),
  title: Joi.string().min(1).max(500).required()
    .messages({
      'string.base': 'Le titre doit être une chaîne de caractères',
      'string.empty': 'Le titre ne peut pas être vide',
      'string.min': 'Le titre doit contenir au moins 1 caractère',
      'string.max': 'Le titre ne peut pas dépasser 500 caractères',
      'any.required': 'Le titre est requis'
    }),
  overview: Joi.string().max(2000).optional().allow('')
    .messages({
      'string.base': 'Le synopsis doit être une chaîne de caractères',
      'string.max': 'Le synopsis ne peut pas dépasser 2000 caractères'
    }),
  poster_path: Joi.string().max(500).optional().allow(null, '')
    .messages({
      'string.base': 'Le chemin du poster doit être une chaîne de caractères',
      'string.max': 'Le chemin du poster ne peut pas dépasser 500 caractères'
    }),
  release_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().allow(null, '')
    .messages({
      'string.base': 'La date de sortie doit être une chaîne de caractères',
      'string.pattern.base': 'La date de sortie doit être au format YYYY-MM-DD'
    }),
  vote_average: Joi.number().min(0).max(10).optional().allow(null)
    .messages({
      'number.base': 'La note moyenne doit être un nombre',
      'number.min': 'La note moyenne doit être supérieure ou égale à 0',
      'number.max': 'La note moyenne doit être inférieure ou égale à 10'
    }),
  vote_count: Joi.number().integer().min(0).optional().allow(null)
    .messages({
      'number.base': 'Le nombre de votes doit être un nombre',
      'number.integer': 'Le nombre de votes doit être un entier',
      'number.min': 'Le nombre de votes doit être supérieur ou égal à 0'
    })
});

// Schéma de validation pour les paramètres de pagination
const paginationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional().default(20)
    .messages({
      'number.base': 'La limite doit être un nombre',
      'number.integer': 'La limite doit être un entier',
      'number.min': 'La limite doit être supérieure ou égale à 1',
      'number.max': 'La limite ne peut pas dépasser 100'
    }),
  offset: Joi.number().integer().min(0).optional().default(0)
    .messages({
      'number.base': 'L\'offset doit être un nombre',
      'number.integer': 'L\'offset doit être un entier',
      'number.min': 'L\'offset doit être supérieur ou égal à 0'
    })
});

// Middleware de validation générique
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        error: 'Erreur de validation',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Remplacer les données validées
    req[property] = value;
    next();
  };
};

// Middlewares spécifiques
const validateLike = validate(likeSchema);
const validateMovie = validate(movieSchema);
const validatePagination = validate(paginationSchema, 'query');

module.exports = {
  validate,
  validateLike,
  validateMovie,
  validatePagination,
  likeSchema,
  movieSchema,
  paginationSchema
};
