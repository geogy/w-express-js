const jwt = require('jwt-simple');
const validator = require('validator');

const service = require('../services/weets');

exports.create = (request, response) =>
  service
    .weet()
    .then(weetResponse => {
      if (validator.isLength(weetResponse.data, { min: 1, max: 140 })) {
        const jwtDecoded = jwt.decode(request.headers.authorization, process.env.SECRET);
        return service.create({ content: weetResponse.data, userId: jwtDecoded.id });
      }
      throw new Error('Weet must have 140 characters maximum');
    })
    .then(model => {
      response.status(201).send(model);
    })
    .catch(error => {
      const errors = JSON.stringify(error) === '{}' ? { error: error.message } : error;
      response.status(400).send(errors);
    });

exports.list = (request, response) => {
  service
    .paginate(request.query.page, request.query.limit)
    .then(records => {
      response.status(200).json(records);
    })
    .catch(error => {
      response.status(400).json(error);
    });
};

exports.rating = (request, response) => {
  const jwtDecoded = jwt.decode(request.headers.authorization, process.env.SECRET);

  service
    .rating(jwtDecoded.id, request.params.id, request.body.score)
    .then(() => {
      response.status(200).send();
    })
    .catch(error => {
      response.status(400).json(error);
    });
};
