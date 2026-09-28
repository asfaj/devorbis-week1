const mongoose = require("mongoose");
const Task = require("../models/Task");

const ALLOWED_FIELDS = ["title", "description", "status", "dueDate"];

// Only accept fields we expect (blocks users from setting e.g. "user")
const pickAllowed = (body) =>
  Object.fromEntries(
    Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key)),
  );

const handleError = (res, err) => {
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json({ error: message });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ error: `Invalid value for ${err.path}` });
  }
  console.error(err);
  return res.status(500).json({ error: "Server error" });
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(tasks);
  } catch (err) {
    handleError(res, err);
  }
};

exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid task id" });
    }
    const task = await Task.findOne({ _id: id, user: req.user.userId });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(200).json(task);
  } catch (err) {
    handleError(res, err);
  }
};

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...pickAllowed(req.body),
      user: req.user.userId,
    });
    res.status(201).json(task);
  } catch (err) {
    handleError(res, err);
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid task id" });
    }
    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user.userId },
      pickAllowed(req.body),
      { new: true, runValidators: true },
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(200).json(task);
  } catch (err) {
    handleError(res, err);
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid task id" });
    }
    const task = await Task.findOneAndDelete({
      _id: id,
      user: req.user.userId,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
};
