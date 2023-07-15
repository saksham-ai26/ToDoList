const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const _ = require('lodash');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');     


app.use(express.static("public"));
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true});

const itemSchema = {
    name: String
};

const Item = mongoose.model('Item', itemSchema); 


const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const ListSchema = {
  name : String,
  items : [itemSchema]
}

const List = mongoose.model("List", ListSchema);

  


//   async function insertData() {
//     try {
//       const result = await Item.insertMany(defaultItems);
//       console.log(result);
//     } catch (error) {
//       console.error(error);
//     }
//   }
  
  
  
//   async function findData() {
//     try {
//       const result = await Item.find();
//         foundItems = result;
      
      
      
//     } catch (error) {
//       console.error(error);
        
//     }
   
//   }
// Item.insertMany(defaultItems, function(err) {
//     if(err){
//         console.log(err);
//     } else {
//         console.log("Successfully saved default items to DB");
//     }
// })



// app.get('/', async (req, res) => {
    
//     var today = new Date();
//     // var currentDay = today.getDay();
//     // const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//     // var day = days[currentDay];
//     var options = {
//         weekday: "long",
//         day: "numeric",
//         month: "long"
//     };
//     var day = today.toLocaleDateString("en-US", options);
//     try {
//         const foundItems = await Item.find().exec();
//         if(foundItems.length === 0){
//             await Item.insertMany(defaultItems, function(err) {
//                 if(err){
//                     console.log(err);
//                 } else {
//                     console.log("Successfully saved default items to DB");
//                 }
//             });
//             res.redirect('/');
//         } else {
//             res.render('list', {kindOfDay: day, newListItem: foundItems});
//         }
//     } catch (error) {
//         console.error(error);
//     }



    
//     // if(foundItems.length === 0){
//     //     insertData();
//     //     console.log("Hello1");
//     //     return res.redirect('/');
//     // }
//     // else{
//     //     console.log("Hello2");
        
        
//     // }});
//     });
app.get('/', async (req, res) => {

    var today = new Date();
    var options = {
      weekday: "long",
      day: "numeric",
      month: "long"
    };
    var day = today.toLocaleDateString("en-US", options);
  
    try {
      const foundItems = await Item.find().exec();
      if (foundItems.length === 0) {
        await Item.insertMany(defaultItems);
        console.log("Successfully saved default items to DB");
        res.redirect('/');
      } else {
        res.render('list', { listTitle: "Today", newListItem: foundItems });
      }
    } catch (error) {
      console.error(error);
    }
  });


    // res.render('list' , {kindOfDay : day, newListItem: foundItems});       
    
app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  // await List.findOne({name : customListName}, function(err, foundList){
  //   if(!err){
  //     if(!foundList){
  //       const list = new List({
  //         name : customListName,
  //         items : defaultItems
  //       }) 
  //       list.save();
  //       res.redirect("/" + customListName);
  //     } else {
  //       res.render("list", {listTitle : foundList.name, newListItem: foundList.items});
  //     }
  //   }
  // })
  try {
    const foundList = await List.findOne({ name: customListName }).exec();
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      await list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", { listTitle: foundList.name, newListItem: foundList.items });
    }
  } catch (error) {
    console.error(error);
  }
  
      
  
});
app.post('/', async (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });
    if(listName === "Today"){
      item.save();
    res.redirect('/');}
    else{
      // await List.findOne({name : listName}, function(err, foundList){
      //   foundList.items.push(item);
      //   foundList.save();
      //   res.redirect("/" + listName)
      // })
      try {
        const foundList = await List.findOne({ name: listName }).exec();
        const item = new Item({
          name: itemName
        });
        foundList.items.push(item);
        await foundList.save();
        res.redirect("/" + listName);
      } catch (error) {
        console.error(error);
      }
      
    }
    });

app.post('/delete', async (req, res) => {
        const checkedItemId = req.body.checkbox;
        const listName = req.body.listName;
        
        try {
          if(listName === "Today"){
          await Item.findByIdAndRemove(checkedItemId).exec();
          res.redirect('/');
        } 
        
      else {
          await List.findOneAndUpdate({name : listName}, {$pull : {items : {_id : checkedItemId}}}).exec();
            res.redirect("/" + listName);
          
        } }catch (error) {
          console.error(error);
        }
      });
      
      
      





app.listen(5000, () => {
    console.log('Server is running on port 5000');
    }
);
