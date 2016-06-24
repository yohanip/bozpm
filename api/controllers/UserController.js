/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  create: function (req, res) {
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(403).json({error: 'Password doesn\'t match, What a shame!'});
    }

    sails.models.user.create(req.body).exec(function (err, user) {
      if (err) {
        return res.status(403).json({error: err});
      }
      // If user created successfuly we return user and token as response
      if (user) {
        // NOTE: payload is { id: user.id}
        res.send({user: user, token: jwToken.issue(user.toJSON())});
      }
    });
  }
};