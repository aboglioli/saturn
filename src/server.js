const Hapi = require('hapi');
const corsHeaders = require('hapi-cors-headers');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');

const config = require('./config');
const routes = require('./routes');
const { authenticate } = require('./core/authentication');

const server = new Hapi.Server();

server.connection({
  host: config.app.host,
  port: config.app.port,
  routes: {
    cors: {
      origin: ['*'],
      credentials: true,
      additionalHeaders: ['Origin', 'Access-Control-Allow-Origin']
    }
  }
});

server.register(require('hapi-async-handler'), function(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});

server.register([
  Inert,
  Vision,
  {
    register: HapiSwagger,
    options: config.swagger
  }], (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });

server.register(require('hapi-auth-jwt2'), err => {
  if(err) {
    console.error(err);
    process.exit(1);
  }

  server.auth.strategy('jwt', 'jwt', {
    key: config.app.jwtKey,
    validateFunc: authenticate,
    verifyOptions: {
      algorithms: ['HS256']
    }
  });

  server.route(routes);
});

server.ext('onPreResponse', corsHeaders);

server.start((err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log('Server running at:', server.info.uri);
});

module.exports = server;
