//jshint esversion:6

const express = require("express");
const mongoose=require("mongoose");
const _=require("lodash");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");




const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.set('strictQuery', true);

main().catch(err => console.log(err));

async function main() {
  // Use connect method to connect to the server
  await mongoose.connect('mongodb+srv://vishesh3569:Vishesh%403569@cluster0.q9spcxh.mongodb.net/todolistDB');
}

const itemSchema={
  name: String
};
const Item=new mongoose.model("Item",itemSchema);
const item1=new Item({
  name: "Welcome to todolist"
});
const item2=new Item({
  name: "click + to add items"
});
const item3=new Item({
  name: "<-- click to delete items"
});
const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemSchema]
}
const List=mongoose.model("List",listSchema);




app.get("/", function(req, res) {


Item.find({},function(err,founditems){

  if(founditems.length===0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Hurray!");
      }
    });
    res.redirect("/");
  }

  else{

  res.render("list", {listTitle: "Today", newListItems: founditems});
}
})
});

app.get("/:customlistName",function(req,res){
  const customlistName=_.capitalize(req.params.customlistName);
  List.findOne({name:customlistName},function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list=new List({
          name:customlistName,
          items:defaultItems
        })
        list.save();

        res.redirect("/"+customlistName);
      }
      else{

        res.render("list",{listTitle: customlistName, newListItems: foundlist.items})
      }
    }
  })

})

app.post("/", function(req, res){

  const newitem = req.body.newItem;
  const listTitle=req.body.list;

  const item=new Item({
    name: newitem
  })
  if(listTitle==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listTitle},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listTitle);
    })
  }

});
app.post("/delete",function(req,res){
  const checkedId=req.body.checkbox;
  const listname=req.body.listname;
  if(listname==="Today"){
    Item.findByIdAndRemove(checkedId,function(err){
      if(!err){

        res.redirect("/");
      }
    })

  }
  else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkedId}}},function(err,foundlist){
      if(!err){
        res.redirect("/"+listname);
      }
    })
  }

})



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
