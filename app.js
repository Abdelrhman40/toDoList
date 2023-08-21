//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const { _ } = require("lodash");

const app = express();

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-abdulrahman:test1234@cluster0.2n8naqo.mongodb.net/todolisttDB");
// mongoose.connect("mongodb://127.0.0.1:27017/fruitsDB");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = {
  name:String
};

const Item = mongoose.model(
  "Item",
  itemsSchema
);

const listSchema= {
  name:String,
  items : [itemsSchema]
};

const List = mongoose.model("List",listSchema);

const item1 = new Item({
  name:"welcome to todolist!"
});
const item2 = new Item({
  name:"hello from mongoose!"
});
const item3 = new Item({
  name:"<-- Hit this to delete an item!"
});

const defaultItems = [item1,item2,item3];
let items = [] ;
let callItems = async function () {
   items = await Item.find();
   //console.log(items);
};



app.get("/", async function(req, res) {
  await callItems();
  try{
    if (items.length ===0) {
      let i = await Item.insertMany(defaultItems);
      //console.log(items.length); 
      res.redirect("/");
    } else {
      //console.log(items.length);
       callItems(); 
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  
  }catch(err){
    console.log(err);
  }
});

app.post("/",async function(req, res){

  const itemName =await req.body.newItem;
  const listTitle =await req.body.list;
  // console.log(listTitle);
  let addedItem =new Item ({
    name:itemName
  });
  if (listTitle ==="Today") {
      addedItem.save();
      //console.log(m);
      res.redirect("/");
  } else {
   let list = await List.findOne({name:listTitle});
  //  console.log(list);
   let addeldtoList = list.items.push(addedItem);
  //  console.log("done");
   list.save();
   res.redirect('/'+listTitle);
  }
  
});



app.post("/delete",async function(req,res){
  let chekedID =await req.body.checkbox;
  let listName =await req.body.listName;

  if (listName==="Today") {
    let m = await Item.findByIdAndRemove({_id:chekedID});
    //console.log(m.deletedCount);
    res.redirect("/");
  } else {
    let updatedItem =await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:chekedID}}});
    res.redirect("/"+listName);
  } 
})

app.get("/:customListName",async function(req,res){
  let customListName = await _.capitalize(req.params.customListName);
  let findItem = await List.findOne({name:customListName});

  if (findItem === null) {
    let list =new List({
      name:customListName,
      items:defaultItems
    });
    list.save();
    res.redirect("/"+customListName);
  } else {
    // console.log(findItem);
    // console.log("Exists");
    res.render("list",{listTitle:findItem.name , newListItems:findItem.items })
  }

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
