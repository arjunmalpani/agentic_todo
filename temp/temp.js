const connectDB = require("./services/db");
connectDB();
const {
  createTodo,
  searchTodoByStrings,
} = require("./controllers/todoController");

createTodo("learn NodeJS", "Learn NodeJS from scratch").then((res) => {
  console.log(res);
});

// searchTodoByStrings("learn", "pending").then((res) => {
//   console.log(res);
// });