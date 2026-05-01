const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).send({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret');
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).send({ error: 'Unable to login' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Unable to login' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret');
    res.send({ user, token });
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: 'Internal server error' });
  }
};


const getProfile = async (req, res) => {
  res.send(req.user);
};

module.exports = {
  register,
  login,
  getProfile,
};
