import model from './model.js';
import { v4 as uuidv4 } from "uuid";

export const createUser = (user) => {
  // delete user._id;
  return model.create(user);
};
export const findAllUsers = () => model.find();
export const findUserById = (userId) => model.findById(userId);
export const findUserByUsername = (username) => model.findOne({ username: username});
export const findUsersByPartialName = (partialName) => {
  const regax = new RegExp(partialName, "i");
  return model.find({
    $or: [
      { firstName: { $regex: regax } },
      { lastName: { $regex: regax } },
    ],
  })
}
export const findUsersByRole = (role) => model.find({ role: role });
export const findUserByCredentials = (username, password) => model.findOne({ username, password });
export const updateUser = (userId, user) => model.updateOne({ _id: userId }, { $set: user });
export const deleteUser = (userId) => model.deleteOne({ _id: userId });