import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import prisma from "../prisma/db.js";
import * as dotenv from "dotenv";
import nodemailer from "nodemailer";
import { dirname } from "path";
import fs from "fs/promises";
const __dirname = dirname(new URL(import.meta.url).pathname);
const crypto = await import("node:crypto");
dotenv.config();

//deleting image if error createdD
async function deleteImage(path) {
  try {
    await fs.unlink(path);
    console.log("delete done");
  } catch (error) {
    console.log(`file delete faild for  ${error}`);
  }
}

//Email confg
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "omarsabra509@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
});

export const signup = async (req, res, next) => {
  const { email, name, password, country, username, about, websiteUrl } =
    req.body;
  const userPhoto = req.file.path;
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("validation faild");
      error.statusCode = 422;
      error.data = errors.array();
      deleteImage(userPhoto);
      return next(error);
    }
    const checkUserName = await prisma.user.findUnique({
      where: { username: username },
    });
    if (checkUserName) {
      const error = new Error("Username is used");
      error.statusCode = 406;
      error.data = errors.array();
      deleteImage(userPhoto);
      return next(error);
    }
    const user = await prisma.user.findFirst({ where: { email: email } });
    if (user) {
      const error = new Error("email found");
      error.statusCode = 401;
      error.data = { message: "email is founded in database" };
      deleteImage(userPhoto);
      return next(error);
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashPassword,
        name: name,
        username: userName,
        country: country,
        about: about ? about : null,
        websiteUrl: websiteUrl ? websiteUrl : null,
        userPhoto: userPhoto ? userPhoto : null,
      },
      select: {
        passwordResetToken: false,
        resetTokenExp: false,
        username: true,
        email: true,
        name: true,
      },
    });
    res.status(201).json({
      message: "user signedUp",
      status: true,
      user: newUser,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    deleteImage(userPhoto);
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  let errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error("validation faild");
      error.statusCode = 422;
      error.data = errors.array();
      return next(error);
    }

    const user = await prisma.user.findFirst({ where: { email: email } });
    if (!user) {
      const error = new Error("Email not found");
      error.statusCode = 401;
      return next(error);
    }
    const passCheck = await bcrypt.compare(password, user.password);
    if (!passCheck) {
      const error = new Error("Wrong password ");
      error.statusCode = 401;
      return next(error);
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user.id,
        username: user.username,
      },
      process.env.JWTSECERT,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      token: token,
      userName: user.username,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
export const getProfile = async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await prisma.user.findFirst({
      where: { username: username },
      select: {
        id: true,
        username: true,
        name: true,
        userPhoto: true,
        about: true,
        websiteUrl: true,
        passwordResetToken: false,
        resetTokenExp: false,
        password: false,
        country: false,
      },
    });
    if (!user) {
      const error = new Error("username not found");
      error.statusCode = 401;
      error.data = { message: "username is not founded in database" };
      return next(error);
    }
    const createdPosts = await prisma.post.findMany({
      where: { authorId: +req.userId },
      select: {
        id: false,
        authorId: true,
        title: true,
        description: true,
        image: true,
      },
    });
    const favPosts = await prisma.favorite.findMany({
      where: { userId: +req.userId },
      include: {
        post: {
          select: {
            id: false,
            authorId: true,
            title: true,
            description: true,
            image: true,
          },
        },
      },
    });
    const followingNum = await prisma.userFollows.count({
      where: { followingId: user.id },
    });
    const followersNum = await prisma.userFollows.count({
      where: { followerId: user.id },
    });
    res.status(200).json({
      user: user,
      createdPosts: createdPosts,
      favPosts: favPosts,
      followingNum: followingNum,
      followersNum: followersNum,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
export const resetPass = async (req, res, next) => {
  const { email } = req.body;
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("validation faild");
      error.statusCode = 422;
      error.data = errors.array();
      return next(error);
    }
    const user = await prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      const error = new Error("user not found");
      error.statusCode = 404;
      return next(error);
    }
    const token = crypto.randomBytes(20).toString("hex");
    await prisma.user.update({
      where: { email: email },
      data: { passwordResetToken: token, resetTokenExp: Date.now() + 120000 },
    });
    const emailSend = await transporter.sendMail({
      to: email,
      from: "omarsabra509@gmail.com",
      subject: "Password Reset",
      html: `
        <p>You requested a password reset</p>
        <p>Click this <h1><a href="${
          req.protocol + "://" + req.get("host")
        }/reset/passowrd/${user.username}">link</a></h1></p>
        `,
    });
    if (emailSend.envelope.to[0] !== email) {
      const error = new Error("send reset email faild");
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }
    res.status(200).json({
      message: "email send successfully",
      userId: user.id,
      token: token,
      status: true,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const tokenValid = async (req, res, next) => {
  const token = req.body.token;
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("validation faild");
      error.statusCode = 422;
      error.data = errors.array();
      return next(error);
    }
    const user = await prisma.user.findFirst({
      where: { passwordResetToken: token },
    });
    if (!user) {
      return res.status(200).json({
        valid: false,
        status: false,
      });
    }
    res.status(200).json({
      valid: true,
      satus: false,
      username: user.username,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const newPass = async (req, res, next) => {
  const { newPassword, token } = req.body;
  const username = req.params.username;
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("validation faild");
      error.statusCode = 422;
      error.data = errors.array();
      return next(error);
    }
    const newPassHash = await bcrypt.hash(newPassword, 12);
    const user = await prisma.user.update({
      where: { passwordResetToken: token, username: username },
      data: {
        password: newPassHash,
        passwordResetToken: null,
        resetTokenExp: null,
      },
    });
    res.status(200).json({
      user: user,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const followUser = async (req, res, next) => {
  const followingUserName = req.params.username;
  try {
    const followingUser = await prisma.user.findUnique({
      where: { username: followingUserName },
    });
    if (!followingUser) {
      const error = new Error("username not found");
      error.statusCode = 404;
      return next(error);
    }
    if (followingUser === +req.userId) {
      const error = new Error("not allow to follow yourself");
      error.statusCode = 401;
      return next(error);
    }
    const follow = await prisma.userFollows.create({
      data: { followerId: +req.userId, followingId: followingUser.id },
    });
    res.status(200).json({
      status: true,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const getFollower = async (req, res, next) => {
  try {
    const followers = await prisma.userFollows.findMany({
      where: { followingId: +req.userId },
      select: {
        followerId: false,
        followingId: false,
        follower: {
          select: {
            username: true,
            name: true,
            userPhoto: true,
            about: false,
            websiteUrl: false,
            passwordResetToken: false,
            resetTokenExp: false,
            password: false,
            country: false,
          },
        },
      },
    });
    res.status(200).json({
      followers: followers,
      status: true,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const getfollowing = async (req, res, next) => {
  try {
    const following = await prisma.userFollows.findMany({
      where: { followerId: +req.userId },
      select: {
        followerId: false,
        followingId: false,
        following: {
          select: {
            username: true,
            name: true,
            userPhoto: true,
            about: false,
            websiteUrl: false,
            passwordResetToken: false,
            resetTokenExp: false,
            password: false,
            country: false,
          },
        },
      },
    });
    res.status(200).json({
      following: following,
      status: true,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
