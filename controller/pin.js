import prisma from "../prisma/db.js";
import fs from "fs/promises";
//deleting image if gives error
async function deleteImage(path) {
  try {
    await fs.unlink(path);
    console.log("delete done");
  } catch (error) {
    console.log(`file delete faild for  ${error}`);
  }
}
export const buildPin = async (req, res, next) => {
  const { title, description } = req.body;
  const PinImage = req.file.path;
  try {
    const pin = await prisma.post.create({
      data: {
        authorId: +req.userId,
        title: title ? title : null,
        description: description ? description : null,
        image: PinImage,
      },
      select: {
        title: true,
        description: true,
        image: true,
        author: {
          select: {
            username: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "pin created",
      status:true,
      pin: pin,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    deleteImage(PinImage);
    next(error);
  }
};

export const getPin = async (req, res, next) => {
  const pinId = +req.params.pinId;
  try {
    const pin = await prisma.post.findUnique({
      where: { id: pinId },
    });
    if (!pin) {
      const error = new Error("pin not found");
      error.statusCode = 404;
      return next(error);
    }
    return res.status(200).json({
      message: "well done every thing is checked",
      status:true,
      pin: pin,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const getPins = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany();
    res.status(200).json({
      posts: posts,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const putFavPin = async (req, res, next) => {
  const pinId = req.params.pinId;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const favpin = await prisma.favorite.create({
      data: {
        userId: +req.userId,
        postId: +pinId,
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

export const getFav = async (req, res, next) => {
  const username = req.params.username;
  try {
    const favorites = await prisma.favorite.findMany({
      orderBy: { createdAt: "asc" },
      where: { userId: req.userId },
      include: { post: true },
    });
    const posts = favorites.map((f) => f.post);
    res.json({
      posts: posts,
      status: true,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
