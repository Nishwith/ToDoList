//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose")
mongoose.set('strictQuery', true);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-nishwith:test123@cluster0.cbqrkgd.mongodb.net/todolistDB", { useNewUrlParser: true })
const itemsSchema = {
    name: String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
    name: "Welcome to your ToDoList!"
});
const item2 = new Item({
    name: "Hit the + button to add a new item."
});
const item3 = new Item({
    name: "<--Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];
const listSchema = {
    name: String,
    items: [itemsSchema]
}
const List = mongoose.model("List", listSchema);
app.get("/", function(req, res) {

    Item.find({}, function(err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Success");
                }
            })
            res.redirect("/")
        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    })


});

app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    if (listName === "Today") {
        item.save();
        res.redirect("/")

    } else {
        List.findOne({ name: listName }, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName)
        })
    }

});
app.post("/delete", function(req, res) {
    const checkedId = req.body.checkBox;
    const listName = req.body.listName;
    if (listName === "Today") {
        Item.findByIdAndRemove(checkedId, function(err) {
                if (!err) {
                    res.redirect("/")
                }
            }

        )
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedId } } }, function(err, findOne) {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }
})

app.get("/:customListsName", function(req, res) {
    const customListsName = _.capitalize(req.params.customListsName);
    List.findOne({ name: customListsName }, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListsName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/" + customListsName)
            } else {
                res.render("list", { listTitle: customListsName, newListItems: foundList.items });
            }
        }
    })
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});