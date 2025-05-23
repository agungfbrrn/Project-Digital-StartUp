import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

export const register = async (req, res, next) => {
  try {
    const hash = bcrypt.hashSync(req.body.password, 5);

    // Tentukan role berdasarkan isSeller
    const role = req.body.isSeller ? "seller" : "buyer";

    const newUser = new User({
      ...req.body,
      password: hash,
      role, // Tambahkan role
    });

    await newUser.save();
    res.status(201).send("Pengguna telah dibuat.");
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) return next(createError(404, "Pengguna tidak ditemukan!"));

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect)
      return next(createError(400, "Password salah atau username!"));

    const token = jwt.sign(
      {
        id: user._id,
        isSeller: user.isSeller,
        role: user.role, // Tambahkan role ke dalam token
      },
      process.env.JWT_KEY
    );

    const { password, ...info } = user._doc;
    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .send(info);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .send("Pengguna telah keluar.");
};
