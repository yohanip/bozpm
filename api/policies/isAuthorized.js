/**
 * isAuthorized
 *
 * @description :: Policy to check if user is authorized with JSON web token
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Policies
 */
"use strict";

module.exports = function (req, res, next) {
  var token;

  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0],
        credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } else {
      return res.status(403).send({error: 'Format is Authorization: Bearer [token]'});
    }
  } else if (req.param('token')) {
    token = req.param('token');
    // We delete the token from param to not mess with blueprints
    delete req.query.token;
  } else {
    return res.status(403).send({error: 'No Authorization header was found'});
  }

  jwToken.verify(token, function (err, token) {
    if (err) return res.json(401, {error: 'Invalid Token!'});

    // do we have this person?
    sails.models.user.find({email: token}).then(rows => {
      if(rows.length < 1) return res.status(403).send( {error: 'Who are you?'})
      req.token = rows[0]; // This is the decrypted token or the payload you provided

      next();
    })

  });
};