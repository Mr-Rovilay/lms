import User from "../models/userModel.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import validator from "validator"
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const loginUser = async (req, res) => {
  const { email, password } = req.body

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "User does not exist" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    generateToken(res, user, `Welcome back ${user.name}`);

    res.status(200).json({ email, token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email" })
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ error: "Password not strong enough" })
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(400).json({ error: "Email already exist" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    await User.create({ name, email, password: hashedPassword })

    return res.status(201).json({
      success:true,
      message:"Account created successfully."
  })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
export const logout = async (_,res) => {
  try {
      return res.status(200).cookie("token", "", {maxAge:0}).json({
          message:"Logged out successfully.",
          success:true
      })
  } catch (error) {
      console.log(error);
      return res.status(500).json({
          success:false,
          message:"Failed to logout"
      }) 
  }
}
export const getUserProfile = async (req,res) => {
  try {
      const userId = req.id;
      const user = await User.findById(userId).select("-password").populate("enrolledCourses");
      if(!user){
          return res.status(404).json({
              message:"Profile not found",
              success:false
          })
      }
      return res.status(200).json({
          success:true,
          user
      })
  } catch (error) {
      console.log(error);
      return res.status(500).json({
          success:false,
          message:"Failed to load user"
      })
  }
}

export const updateProfile = async (req,res) => {
  try {
      const userId = req.id;
      const {name} = req.body;
      const profilePhoto = req.file;

      const user = await User.findById(userId);
      if(!user){
          return res.status(404).json({
              message:"User not found",
              success:false
          }) 
      }
      // extract public id of the old image from the url is it exists;
      if(user.photoUrl){
          const publicId = user.photoUrl.split("/").pop().split(".")[0]; // extract public id
          deleteMediaFromCloudinary(publicId);
      }

      // upload new photo
      const cloudResponse = await uploadMedia(profilePhoto.path);
      const photoUrl = cloudResponse.secure_url;

      const updatedData = {name, photoUrl};
      const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {new:true}).select("-password");

      return res.status(200).json({
          success:true,
          user:updatedUser,
          message:"Profile updated successfully."
      })

  } catch (error) {
      console.log(error);
      return res.status(500).json({
          success:false,
          message:"Failed to update profile"
      })
  }
}