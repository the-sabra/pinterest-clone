import { validationResult } from "express-validator";
import prisma from "../prisma/db.js";

// comments: {..., replies: [{...user, comment}]}
export const getComments = async (req, res, next) => {
  const pinId = req.params.pinId;
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: +pinId, parentId: null },
      include: {
        User: {
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
    const replyComment = await prisma.comment.findMany({
      where: { postId: +pinId, parentId: { not: null } },
      include: {
        User: {
          select: {
            username: true,
            name: true,
            about: true,
            userPhoto: true,
            websiteUrl: true,
            passwordResetToken: false,
            resetTokenExp: false,
            password: false,
            country: false,
          },
        },
      },
    });
    res.json({
      comments: comments,
      replies: replyComment,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const createComment = async (req, res, next) => {
  const pinId = req.params.pinId;
  const { content } = req.body;
  let parentId = null;
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("validation faild");
      error.statusCode = 422;
      error.data = errors.array();
      return next(error);
    }
    const comment = await prisma.comment.create({
      data: {
        postId: +pinId,
        userId: +req.userId,
        content: content,
        parentId: parentId,
      },
    });
    res.status(201).json({
      message: "comment saved done",
      status: true,
      comment: comment,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const replyComment = async (req, res, next) => {
  const pinId = req.params.pinId;
  try {
    const { parentId, content } = req.body;
    const comment = await prisma.comment.create({
      data: {
        postId: +pinId,
        userId: req.userId,
        content: content,
        parentId: parentId,
      },
    });
    res.status(200).json({
      comment: comment,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const loveComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: +commentId },
    });
    if (!comment) {
      const error = new Error("comment not found");
      error.statusCode = 404;
      error.data = "where is the comment 😡";
      return next(error);
    }
    const love = await prisma.love.create({
      data: {
        userId: +req.userId,
        commentId: +commentId,
      },
    });
    res.status(201).json({
      status: true,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const getLoveCommnet = async (req, res, next) => {
  const { commentId } = req.params;
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: +commentId },
    });
    if (!comment) {
      const error = new Error("comment not found");
      error.statusCode = 404;
      error.data = "where is the comment 😡";
      return next(error);
    }
    const love = await prisma.love.count({ where: { commentId: +commentId } });
    res.status(200).json({
      love: love,
      status: true,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const deleteLove = async (req, res, next) => {
  const { commentId } = req.params;
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: +commentId },
    });
    if (!comment) {
      const error = new Error("comment not found");
      error.statusCode = 404;
      error.data = "where is the comment 😡";
      return next(error);
    }
    const love = await prisma.love.delete({
      where: {
        userId_commentId: {
          userId: +req.userId,
          commentId: +commentId,
        },
      },
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
