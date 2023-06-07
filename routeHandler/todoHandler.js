const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const todoSchema = require("../schemas/todoSchema");
const userSchema = require("../schemas/userSchema");
const Todo = new mongoose.model("Todo", todoSchema);
const User = new mongoose.model("User", userSchema);
const checkLogin = require("../middlewares/checkLogin");

// GET ALL THE TODOS
router.get("/", checkLogin, async (req, res) => {
  console.log(req.username);
  try{
    const todos = await Todo.find({"title": "populate rational data "})
    .populate("user","name username -_id")  //get info from User table
    .select({   //.select(query helpers) //status:"active" (filtering)
      //Do not show these columns
        _id: 0,
        __v: 0,
        date:0
    }).limit(2);  //limited by 2 data(query helpers)
    res.json(todos);
  }catch(err){
    res.status(500).json({
      error: "There was a server side error!",
    });
  }
});

//GET ACTIVE TODOS(instance method)
router.get("/active", checkLogin, async (req, res) => {
  try{
    const todo = new Todo();
    const data = await  todo.findActive();
    res.status(200).json({
      data,
    });
  }catch(err){
    res.status(500).json({
      err,
    });
  }
});

//GET ACTIVE TODOS with callback(instance method)
router.get("/active-callback", checkLogin, (req, res) => {
  const todo = new Todo();
  todo.findActiveCallback((data) => {
    res.status(200).json({
      data,
    });
  });
});

// GET Mongo in title (statics)
router.get("/mongo", checkLogin, async (req, res) => {
const data = await Todo.findByJS();
res.status(200).json({
  data,
});
});

// GET MongoDB in title(query helper)
router.get("/language", checkLogin, async (req, res) => {
const data = await Todo.find().byLanguage("mongodb");
res.status(200).json({
  data,
});
});

// GET A TODO by ID
router.get("/:id",checkLogin, async (req, res) => {
  try{
    const todo = await Todo.findById(req.params.id).select({
      //Do not show these columns
        _id: 0,
        __v: 0,
        date:0
    });
    if (!todo) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(todo);
  }catch(err){
    res.status(500).json({
      error: "There was a server side error!",
    });
  }
});

// POST A TODO
router.post("/", checkLogin, async (req, res) => {
  const newTodo = new Todo({
    ...req.body,
    user: req.userId
  });

  try {
    const todo = await newTodo.save();
    //also add in the User table
    await User.updateOne({
      _id: req.userId
    }, {
      $push: {
        todos: todo._id
      }
    });
    res.status(200).json({
      message: "Todo was inserted successfully!",
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({
      error: "There was a server side error!",
    });
  }
});

// POST MULTIPLE TODO
router.post("/all",checkLogin, async (req, res) => {
  const newTodo = req.body;
  try{
    const result = await Todo.insertMany(newTodo);  //statics(instance charai sudhu model dia e call)
    res.status(200).json({
      message: "Todos were inserted successfully!",
    });
  }catch(err){
    res.status(500).json({
      error: "There was a server side error!",
    });
  }
});

// PUT TODO
router.put("/:id", checkLogin,async (req, res) => {
  try{
    const result = await Todo.findByIdAndUpdate(  //statics(instance charai sudhu model dia e call)
      req.params.id,  
      req.body,
      {
      new: true,
      runValidators: true
      });
      if (!result) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({
        message: "Todo was updated successfully!",
      });
  }catch(err){
    res.status(500).json({
      error: "There was a server side error!",
    });
  }
});

// DELETE TODO
router.delete("/:id", checkLogin, async (req, res) => {
  try{
    const deletedUser = await Todo.findByIdAndRemove(req.params.id);  //statics(instance charai sudhu model dia e call)
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      message: "Todo was daleted successfully!",
    });
  }catch(err){
    res.status(500).json({
      error: "There was a server side error!",
    });
  }
});

module.exports = router;