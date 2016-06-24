/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: check if user is an admin or not..
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  // sails.log(req.user)

  if (req.token && req.token.email === 'yohan@boz.co.id') {
    return next();
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.forbidden('You are not permitted to perform this action.');
};
