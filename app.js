//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require ("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//to connect mongoDB
mongoose.connect("mongodb+srv://sundreshdme475:Subbuv%401961@cluster0.s9zwvpb.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}) .then(() => {
  console.log('Connected to MongoDB!');
  // Now you can start using Mongoose models and perform database operations
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

//schema for item
const itemSchema= new mongoose.Schema({
  name:String
});

//model to store datas in DB
const Items=mongoose.model("item",itemSchema);

const item1= new Items({
  name:"hi welcome todo list"
});

const item2= new Items({
  name:"everything goes alright"
});

const item3= new Items({
  name:"good to go"
});

const itemList=[item1,item2,item3];

const listSchema= new mongoose.Schema({
  name:String,
  items:[itemSchema]
})

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Items.find({}).then ((items) => {
    if (items.length===0) {
      Items.insertMany(itemList).then(()=>{console.log("succeed")}).catch((err)=>{console.log(err)});
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: "today", newListItems: items});
    } 
  }).catch ((err) => {console.log(err)});
});

app.get("/:customListName", function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName}).then ((foundName) => {
    if (!foundName) {
      const list= new List({
        name:customListName,
        items:itemList
      });
      list.save();
      res.redirect("/" + customListName)
    }
    else{
      res.render("list", {listTitle: foundName.name, newListItems: foundName.items});
    }
  }).catch((err)=> {console.log(err);});
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item = new Items ({
    name:itemName
  });
  if (listName==="today") {
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}).then((foundList) =>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete",function (req,res) {
  const checkedItemId=(req.body.checkbox);
  const nameList=(req.body.nameList);
  console.log(nameList);
  if (nameList==="today"){
    Items.findByIdAndRemove(checkedItemId).then (() => {console.log("successfully deleted")}).catch ((err) =>{
      console.log(err);
    })
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:nameList},{$pull:{items:{_id:checkedItemId}}}).then(() =>{
      res.redirect("/"+nameList)}).catch((err) =>{
      console.log (err);
    })
  }
  
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
