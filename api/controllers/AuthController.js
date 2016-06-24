/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

"use strict"


module.exports = {
  index: function (req, res) {
    let email = req.param('email'),
      password = req.param('password')

    if (!email || !password) {
      return res.json(403, {error: 'email and password required'});
    }

    sails.models.user.findOne({email: email}, function (error, user) {
      if (!user) {
        return res.json(401, {error: 'invalid email or password'});
      }

      sails.models.user.comparePassword(password, user, function (error, valid) {
        if (error) {
          return res.json(403, {error: 'forbidden'});
        }

        if (!valid) {
          return res.json(401, {error: 'invalid email or password'});
        } else {
          res.json({
            user: user,
            token: jwToken.issue(user.toJSON())
          });
        }
      });
    })
  }
};