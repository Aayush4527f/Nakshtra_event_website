import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { SignupSchema, LoginSchema } from "../schemas/Zodschema.js";
import jwt from "jsonwebtoken";

const Prisma = new PrismaClient();

//this contoller is used for signing up in web application, for authentication
export const signUp = async (req, res) => {
  try {
    const validation = SignupSchema.safeParse(req.body);
    if (validation.success) {
      const { name, email, password } = validation.data;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await Prisma.user.create({
        data: {
          username: name,
          email: email,
          password: hashedPassword,
        },
      });
      res
        .status(200)
        .json({ message: "User created successfully", user: user });
    } else {
      res
        .status(400)
        .json({ message: "Invalid data", validation: validation.error });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

//this controller is used for login in web application, for authentication
export const login = async (req, res) => {
  try {
    const validation = LoginSchema.safeParse(req.body);
    if (!validation.success) {
      res
        .status(400)
        .json({ message: "Invalid data", validation: validation.error });
    }
    const { email, password } = validation.data;
    const user = await Prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      res.status(200).json({ message: "Login successful", token: token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

//this controller is used for adding admin in web application, only admin can add admin
export const addAdmin = async (req, res) => {
  try {
    const isAdmin = await prisma.admin.findUnique({
      where: { id: req.userId },
    });
    
    if (!isAdmin) {
      return res.status(403).json({ message: "Access denied. Only admins can access this route." });
    }
    
    const { email, username, password } = req.body;
    const validation = SignupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation Failed!",
      });
    } else {
      const hashpassword = await bcrypt.hash(password, 10);
      const admin = Prisma.admin.create({
        data: {
          username: username,
          email: email,
          password: hashpassword,
        },
      });
      if (!admin) {
        return res.json({
          message: "Admin not created",
        });
      } else {
        return res.status(200).json({
          Message: "Admin created successfully!",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

//this controller is used for adding image in web application, all users can add image
export const addImage = async (req, res) => {
  try {
    const { userId, images } = req.body;

    const registeredUser = await prisma.registration.findUnique({
      where: { userid: userId },
      select: { imagecount: true },
    });

    if (!registeredUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (registeredUser.imagecount >= 3) {
      return res
        .status(400)
        .json({ message: "You can't add more than 3 images" });
    }

    
    const image = await prisma.image.create({
      data: {
        image: images,
        userid: userId,
      },
    });

    if (!image) {
      return res.status(400).json({ message: "Image not created" });
    }

    await prisma.registration.update({
      where: { userid: userId },
      data: {
        imagecount: registeredUser.imagecount + 1,
      },
    });

    return res.status(200).json({ message: "Image added successfully!" });
  } catch (error) {
    console.error("Error adding image:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//this controller is ued for voting, all users can vote
export const voteImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { userId } = req.body;

    const image = await Prisma.image.findUnique({
      where: { id: imageId },
      select: { votes: true, voterecord: true },
    });

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    if (image.voterecord.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You have already voted for this image" });
    }

    await prisma.image.update({
      where: { id: imageId },
      data: {
        votes: image.votes + 1,
        voterecord: { push: userId },
      },
    });
    return res.status(200).json({ message: "Image voted successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
