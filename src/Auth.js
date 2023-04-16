const jwt = require('jsonwebtoken');
const { communityModel } = require('./models');

async function authentication(req, res, next) {
  try {
    let token = req.headers['authorization'];
    token = token.split(' ');

    const decodedToken = jwt.verify(token[1], 'secret key given by Vikas');
    req.body.userData = decodedToken.userData
    next();
  } catch (error) {
    if (error.message == "invalid token") return res.status(403).send({ status: false, message: "token is invalid" });

    if (error.message == "jwt expired") return res.status(404).send({ status: false, message: "Please Login once again, the token has expired" })

    if (error.message == "invalid signature") return res.status(403).send({ status: false, message: "token is invalid" })

    return res.status(500).send({ message: error.message });
  }
}

async function authorization(req, res, next) {
  try {
    const {
      community,
      userData: { _id: userId },
    } = req.body;

    const communityData = await communityModel.findById(community);
    if (!communityData)
      return res.status(400).send({ message: "community doesn't exist" });

    if (communityData.owner != userId)
      return res
        .status(400)
        .send({ message: 'You are not Authorised' });
    next();
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
}

// async function appAuthorization(req, res, next) {
//   try {
//     const { applicationId } = req.params
//     const { Id } = req.body;

//     const check = await applicationModel.findById(applicationId);
//     if (!check)
//       return res.status(400).send({ message: 'application is not found' });

//     if (check.applicantId != Id)
//       return res
//         .status(400)
//         .send({ message: 'You have not permission to change' });
//     next();
//   } catch (error) {
//     return res.status(500).send({ message: error.message });
//   }
// }







// ----------validations----------//

const isValidName = function (name) {
  const nameRegex = /^[a-zA-Z ]{2,30}$/;
  return nameRegex.test(name);
};

const isValidEmail = function (email) {
  const emailRegex =
    /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
  return emailRegex.test(email);
};

const isValidPassword = function (password) {
  var passRegex = new RegExp(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,15})'
  );
  return passRegex.test(password);
};

module.exports = { authentication, authorization, isValidName, isValidEmail, isValidPassword };