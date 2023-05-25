const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
const transporter = require('../config/emailConfig');

require('dotenv').config()
const signUp = async (req, res) => {
  const { email_address, full_name, phone_number, password } = req.body;

  try {
    const existingUser = await User.findOne({ email_address });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = new User({
      email_address,
      full_name,
      phone_number,
      password
    });

    const savedUser = await user.save();

    // Create a verification token
    const token = jwt.sign({ userId: savedUser._id }, 'akirarizky', { expiresIn: '1h' });
    savedUser.verificationToken = token;
    await savedUser.save();
    // Send the verification email
    const verificationUrl = `http://localhost:3000/emailverification/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: savedUser.email_address,
      subject: 'Please verify your email',
      text: `Please click on the following link to verify your email: ${verificationUrl}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error sending email' });
      } else {
        console.log('Email sent: ' + info.response);
        return res.status(200).json({ message: 'Email sent for verification' });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
};
const generateAccessToken = (userId) => {
    const secretKey = process.env.SECRET; // Ganti dengan kunci rahasia yang aman
    const expiresIn = '1h'; // Waktu berlaku token (misalnya 1 jam)
  
    const payload = {
      userId: userId
    };
  
    const options = {
      expiresIn: expiresIn
    };
  
    const token = jwt.sign(payload, secretKey, options);
    return token;
  };
const verifyEmail = async (req, res) => {
    const { token } = req.params;
    try {
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
        return res.status(404).json({ message: 'User not found or token mismatch' });
        }
        // Update status verifikasi dan hapus token verifikasi
        user.isEmailVerified = true;
        user.verificationToken = undefined;
        user.isActive = true;
        user.accessToken = generateAccessToken(user._id);

        await user.save(); // Menyimpan perubahan pada objek pengguna

        return res.status(200).json({ message: 'Email verification successful' });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: 'Invalid or expired token' });
    }
};
  
const login = async (req, res) => {
    const { email_address, password } = req.body;
  
    try {
      // Cari pengguna berdasarkan alamat email
      const user = await User.findOne({ email_address });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Verifikasi kata sandi
      if (password !== user.password) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
  
      // Pengecekan status pengguna
      if (!user.isActive) {
        return res.status(403).json({ message: 'User is not active' });
      }
  
      if (!user.isEmailVerified) {
        return res.status(403).json({ message: 'User email is not verified' });
      }
  
      // Generate a login token
      const token = jwt.sign({ userId: user._id }, 'akirarizky', { expiresIn: '1h' });
  
      return res.status(200).json({ token });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'An error occurred' });
    }
  };
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('982657535319-2lnthsd4uid3l1pi03nqcfpi6vf43ksh.apps.googleusercontent.com');
  
const loginWithGoogle = async (req, res) => {
    const { idToken } = req.body;
  
    try {
      // Verifikasi token ID dari Google
      const ticket = await client.verifyIdToken({
        idToken,
        audience: client.options.clientId,
      });
      const payload = ticket.getPayload();
  
      // Dapatkan informasi pengguna dari payload
      const { email_address, full_name } = payload;
  
      // Cek apakah pengguna sudah terdaftar dalam database berdasarkan email
      let user = await User.findOne({ email_address });
  
      if (!user) {
        // Jika pengguna belum terdaftar, buat akun baru untuk pengguna
        user = new User({
            email_address,
          full_name: full_name,
          isActive: true,
          isEmailVerified: true,
          // Tambahkan properti lain yang diperlukan untuk model User
        });
  
        // Simpan pengguna ke database
        await user.save();
      }
      // Kirim respons ke klien
      return res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'An error occurred' });
    }
  };

module.exports = { signUp, verifyEmail,login,loginWithGoogle };
