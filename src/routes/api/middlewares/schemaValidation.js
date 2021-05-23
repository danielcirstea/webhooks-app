const schemaValidation = (err, _req, res, next) => {
    if (err.name === 'JsonSchemaValidation') {
        console.log('[API][ERROR] Bad request', JSON.stringify(err.validations));
        return res.status(400).json({ message: 'Bad request', error: err.validations });
    } 
    next(err);
}

module.exports = schemaValidation;