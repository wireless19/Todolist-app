//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

// connection to our local computer
// mongoose.connect("mongodb://localhost:27017/todolistDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });


// connection to our mongodb atlas
mongoose.connect("mongodb+srv://admin-victor:test123@cluster0.lbgby.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const itemsSchema = new mongoose.Schema({
  name: String

});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Buy Food"

});

const item2 = new Item({
  name: "Cook Food"

});

const item3 = new Item({
  name: "Eat Food"

});


const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems, function (err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Successfully saved all items to todolistDB");
//   }

// });

const listSchema = new mongoose.Schema({
  name: String,
  item: [itemsSchema]
});

const List = mongoose.model("List", listSchema);





app.get("/", function (req, res) {


  Item.find(function (err, founditems) {


    // Close the connection to our MongoDB FruitsDB
    // mongoose.connection.close();

    if (founditems.length === 0) {

      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved all items to todolistDB");
        }

      });
      res.redirect("/");

    } else {

      res.render("list", {
        listTitle: "Today",
        newListItems: founditems
      });


    }


  });


  // const day = date.getDate();

});



app.get("/:customlistName", function (req, res) {

  const customlistName = _.capitalize(req.params.customlistName);



  List.findOne({
    name: customlistName
  }, function (err, foundList) {

    if (!err) {

      if (!foundList) {

        // create a new List

        const list = new List({
          name: customlistName,
          item: defaultItems

        });

        list.save();
        res.redirect("/" + customlistName);

      } else {

        // show an existing List

        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.item
        });

      }

    }

  })



});




app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item4 = new Item({

    name: itemName

  });

  if (listName === "Today") {

    item4.save();

    res.redirect("/");

  } else {
    List.findOne({
      name: listName
    }, function (err, foundList) {
      foundList.item.push(item4);
      foundList.save();
      res.redirect("/" + listName);
    });
  }



  // const item = req.body.newItem;
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }


});


app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName

  if (listName === "Today") {

    Item.findByIdAndRemove(checkedItemId, function (err) {

      if (!err) {
        console.log("Successfully deleted the checked item");
        res.redirect("/");
      }

    });

  } else {

    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        item: {
          _id: checkedItemId
        }
      }
    }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });

  }




});


// app.get("/work", function (req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on port 3000");
});