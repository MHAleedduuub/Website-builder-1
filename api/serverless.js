const app = require('../server');

exports.handler = async (event, context) => {
    return app(event, context);
};
