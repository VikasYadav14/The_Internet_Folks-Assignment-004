const { isValidPassword, isValidEmail, isValidName } = require('../Auth');
const { userModel } = require('../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');

const userSignup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!req.body) return res.status(400).send({ error: 'Please provide mandatory fields' })

        if (!isValidEmail(email)) return res.status(400).send({ error: 'Email should be in correct format' })

        if (!isValidPassword(password)) return res.status(400).send({
            error:
                'Password is weak. Use uppercase, lowercase, number, and special character with a minimum size of 8',
        });

        const hashPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({ name, email, password: hashPassword });
        const { updatedAt, __v, ...userData } = user._doc;
        delete userData.password;

        const token = jwt.sign(
            {userData}, 'secret key given by Vikas', {
            expiresIn: '1h',
        });

        return res.status(201).send({ status: true, content: { data: userData, meta: { access_token: token } } });
    } catch (error) {
        return res.status(500).send({ Error: error.message });
    }
}


const userSignin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!isValidEmail(email))
            return res.status(400).send({ error: 'email is not in correct format' });

        const userData = await userModel.findOne({ email }).select({ updatedAt: 0, __v: 0 });
        if (!userData) {
            return res.status(400).send({ error: 'Credentials are incorrect' });
        }

        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if (!isPasswordValid) return res.status(400).send({ error: 'Credentials are incorrect' });

        delete userData['_doc'].password;
        const token = jwt.sign(
            {userData}, 'secret key given by Vikas', {
            expiresIn: '1h',
        });

        return res.status(201).send({ status: true, content: { data: userData, meta: { access_token: token } } });
    } catch (error) {
        return res.status(500).send(error.message);
    }
}


const authMe = async (req, res) => {
    try {
        const { userData } = req.body

        return res.status(200).send({ status: true, content: { data: userData } });
    } catch (error) {
        return res.status(500).send(error.message)
    }
}
module.exports = { userSignup, userSignin, authMe }