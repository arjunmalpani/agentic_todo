const todoModel = require("../models/todoModel");
const mongoose = require("mongoose");
// Creating a todo

async function createTodo(todos) {
  // Check if the input is an array and not empty
  if (!Array.isArray(todos) || todos.length === 0) {
    return {
      error: true,
      message: "At least one todo is required",
    };
  }

  // Iterate over each todo and create them
  const createdTodos = [];
  for (let todoData of todos) {
    const { title, description } = todoData;

    // Check if title is present for each todo
    if (!title) {
      createdTodos.push({
        error: true,
        message: "Title is required",
        todo: todoData, // Include the todo data that failed
      });
      continue; // Skip to the next todo if the title is missing
    }

    try {
      const todo = await todoModel.create({
        title,
        description,
      });
      createdTodos.push(todo); // Add the created todo to the result array
    } catch (error) {
      console.log(error);
      createdTodos.push({
        error: true,
        message: "Error creating todo",
        todo: todoData, // Include the todo data that failed
      });
    }
  }

  return { createdTodos }; // Return the array of created todos or error messages
}

// Searching for a todo
async function searchTodoByStrings(searchString, status) {
  try {
    const query = {
      $or: [
        {
          $or: [
            { title: { $regex: searchString, $options: "i" } }, // Case-insensitive search in the title
            { description: { $regex: searchString, $options: "i" } }, // Case-insensitive search in the description
          ],
        },
        ...(status ? [{ status }] : []), // Filter by status if provided
      ],
    };
    const todos = await todoModel.find(query);
    return { todos }; // Returns all matching todos
  } catch (error) {
    console.log(error);
  }
}
// Updating a todo
async function updateTodoById(id, updates = {}) {
  try {
    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        error: true,
        message: "Invalid ID format",
      };
    }

    // Extract fields from updates object
    const { title, description, status } = updates;

    // Find and update the Todo
    const updatedTodo = await todoModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(title && { title }), // Update only if title is provided
          ...(description && { description }), // Update only if description is provided
          ...(status && { status }), // Update only if status is provided
        },
      },
      { new: true, runValidators: true } // Return updated document and run schema validations
    );

    // If the todo doesn't exist
    if (!updatedTodo) {
      return {
        error: true,
        message: "Todo not found",
      };
    }

    return updatedTodo; // Return the updated todo
  } catch (error) {
    console.error("Error updating Todo:", error);
    return {
      error: true,
      message: "An error occurred while updating the todo",
    };
  }
}
// update multiple todos
async function updateMultipleTodos(updatesArray = []) {
  try {
    if (!Array.isArray(updatesArray) || updatesArray.length === 0) {
      return {
        error: true,
        message: "Invalid input: Provide an array of updates",
      };
    }

    const updatedTodos = await Promise.all(
      updatesArray.map(async ({ id, updates }) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return { id, error: true, message: "Invalid ID format" };
        }

        const { title, description, status } = updates;

        const updatedTodo = await todoModel.findByIdAndUpdate(
          id,
          {
            $set: {
              ...(title && { title }),
              ...(description && { description }),
              ...(status && { status }),
            },
          },
          { new: true, runValidators: true }
        );

        return updatedTodo
          ? updatedTodo
          : { id, error: true, message: "Todo not found" };
      })
    );

    return updatedTodos;
  } catch (error) {
    console.error("Error updating multiple Todos:", error);
    return {
      error: true,
      message: "An error occurred while updating multiple todos",
    };
  }
}

// Get all todos
async function getAllTodos() {
  try {
    const todos = await todoModel.find();

    return { todos };
  } catch (error) {
    console.error("Error updating Todo:", error);
    return {
      error: true,
      message: "An error occurred while getting all todos",
    };
  }
}
// delete todos
// delete todos function
async function deleteTodos(todoIds) {
  try {
    if (!Array.isArray(todoIds) || todoIds.length === 0) {
      return {
        error: true,
        message: "Please provide an array of valid todo IDs.",
      };
    }

    const deletedTodos = await todoModel.deleteMany({
      _id: { $in: todoIds },
    });

    if (deletedTodos.deletedCount === 0) {
      return {
        error: true,
        message: "No todos were deleted. Please check the provided IDs.",
      };
    }

    return {
      success: true,
      message: `${deletedTodos.deletedCount} todos deleted successfully.`,
    };
  } catch (error) {
    console.error("Error deleting todos:", error);
    return {
      error: true,
      message: "An error occurred while deleting todos.",
    };
  }
}

module.exports = {
  createTodo,
  searchTodoByStrings,
  updateTodoById,
  updateMultipleTodos,
  getAllTodos,
  deleteTodos,
};
