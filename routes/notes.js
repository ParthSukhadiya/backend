const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
var fetchuser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");

// Route 1 : Get all the notes using :GET "/api/notes/fetchallnotes"
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        res.json({error:error})
    }
});

// Route 2 : Add a new notes using :POST "/api/notes/fetchallnotes"
router.post("/addnote", fetchuser,
  [
    body("title", "Enter Valid title").isLength({ min: 3 }),
    // body('email','Enter Valid email').isEmail(),
    body("description", "Description must be 5 character").isLength({ min: 5 }),
  ],
  async (req, res) => {
    // const notes=await Notes.find({user:req.user.id})
    try {
      const {title, description, tag} = req.body;
      // if there are errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id
      });
      const savedNotes = await note.save();
      res.json(savedNotes);
    } catch (error) {
        console.log({error:"Serrrrrr"})
    }
  
});

// Route 3 :Update a exiting notes using :POST "/api/notes/fetchallnotes"
router.put("/updatenote/:id", fetchuser,
  // [
  //   body("title", "Enter Valid title").isLength({ min: 3 }),
  //   // body('email','Enter Valid email').isEmail(),
  //   body("description", "Description must be 5 character").isLength({ min: 5 }),
  // ],
  async (req, res) => {
    const  {title,description,tag}=req.body
    // Create new Note object
    try{
    const newNote={};
    if(title)
      {newNote.title=title}
    if(description)
      {newNote.description=description}
    if(tag)
      {newNote.tag=tag}

      // Find the note to be updated and 
      let note=await Note.findById(req.params.id)
      if(!note)
        {return res.status(404).send("Not Found")
      }
      if(note.user.toString() !==req.user.id)
      {
        return res.status(401).send("Not Allowed")
      }
      note = await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
      res.json({note})
    }
      catch(e){
          res.json({e})
      }
  })

// Route 4 :Delete a exiting notes using :DELETE "/api/notes/deletenote"
router.delete("/deletenote/:id", fetchuser,
  async (req, res) => {
    try{
      // Find the note to be updated and delete it
      let note=await Note.findById(req.params.id)
      // console.log(note)
      if(!note)
        {return res.status(404).send("Not Found")
      }
      if(note.user.toString() !==req.user.id)
      {
        return res.status(401).send("Not Allowed")
      }
      note = await Note.findByIdAndDelete(req.params.id)

      res.json({"SUCCESS":"NOte has been Deleted",note:note})}
      catch(e){
        res.json({e})
      }
  })
module.exports = router;
