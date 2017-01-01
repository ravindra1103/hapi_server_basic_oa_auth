var Hapi = require('hapi');
var Bell = require('bell');
var AuthCookie = require('hapi-auth-cookie');

var server = new Hapi.Server();

server.connection({ port: 3000 });

server.register([Bell, AuthCookie], function (err) {
  if (err) {
    console.error(err);
    return process.exit(1);
  }
  var authCookieOptions = {
    password: 'cookie-encryption-password-cookie-encryption-password', //Password used for encryption
    cookie: 'sitepoint-auth', // Name of cookie to set
    isSecure: false
  };
  server.auth.strategy('site-point-cookie', 'cookie', authCookieOptions);
  var bellAuthOptions = {
    provider: 'github',
    password: 'github-encryption-password-github-encryption-password', //Password used for encryption
    clientId: '<your_id>',//'YourAppId',
    clientSecret: '<your_secret>',//'YourAppSecret',
    isSecure: false
  };
  server.auth.strategy('github-oauth', 'bell', bellAuthOptions);
  server.auth.default('site-point-cookie');

  server.route([{
    method: 'GET',
    path: '/login',
    config: {
      auth: 'github-oauth',
      handler: function loginHandler(request, reply) {
        if (request.auth.isAuthenticated) {
          request.cookieAuth.set(request.auth.credentials.profile);
          return reply('Hello User');
        }
        return reply('Not logged in...').code(401);
      }
    }
  }, {
    method: 'GET',
    path: '/account',
    config: {
      handler: function (request, reply) {
        if (request.auth.isAuthenticated) {
          return reply('welcome back to account page');
        }
      }
    }
  }, {
    method: 'GET',
    path: '/',
    config: {
      auth: {
        mode: 'optional'
      },
      handler: function allROuteHandler(request, reply) {
        if (request.auth.isAuthenticated) {
          return reply('welcome back home page mister user');
        }
        return reply('hello stranger!');
      }
    }
  }, {
    method: 'GET',
    path: '/logout',
    config: {
      auth: false,
      handler: function (request, reply) {
        request.cookieAuth.clear();
        reply.redirect('/');
      }
    }
  }
  ]);
  server.start(function (err) {
    if (err) {
      console.error(err);
      return process.exit(1);
    }
    console.log('Server started at %s', server.info.uri);
  });
});
