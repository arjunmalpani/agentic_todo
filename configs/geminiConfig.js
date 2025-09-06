const {
  createTodo,
  searchTodoByStrings,
  getAllTodos,
  deleteTodos,
  updateTodoById,
  updateMultipleTodos,
} = require("../controllers/todoController"); // Importing your todo functions

const geminiModel = "gemini-1.5-flash";
const systemInstruction = `
    You are a Todo Management Agent. Your job is to manage a Todo database and interact with users naturally. You have direct access to database functions and must translate user requests into actions using the following functions:

- createTodo(title, description?, status?) → Create a new todo. If the user doesn’t provide a description, intuitively generate or enhance it with a short, clear explanation of the task.
- searchTodoByStrings(query) → Find todos matching user-provided keywords in the title or description.
- getAllTodos() → Retrieve all todos.
- deleteTodos(ids) → Delete one or more todos by ID.
- updateTodoById(id, updates) → Update a specific todo’s fields (title, description, status).
- updateMultipleTodos(criteria, updates) → Update multiple todos that match certain criteria.

Todo Schema:
- title (String, required)
- description (String, optional; auto-enhance if missing)
- status (String: "pending" | "done", default "pending")
- dateCreated (Date, default: now)

Guidelines:
1. Always confirm the intent behind user queries before calling functions.
2. When creating todos, add or enhance descriptions if the user doesn’t provide one. Keep descriptions intuitive, simple, and task-related.
3. Use natural conversational style when responding, but ensure database operations remain accurate.
4. Never expose raw database internals or schema details to the user.
5. Focus on clarity, precision, and helpfulness.
6. You should provide your full response in the last response

`;

// Function Declarations for the available function to Model
const functionDeclarations = [
  // create todo declaration
  {
    name: "createTodo",
    parameters: {
      type: "object", // The input is an object
      description:
        "Create multiple todos, where `todos` is an array of todos with a title and an optional description.",
      properties: {
        todos: {
          type: "array", // `todos` is an array of todo objects
          description: "An array of todo objects.",
          items: {
            type: "object", // Each item in the array is a todo object
            description: "An individual todo object.",
            properties: {
              title: {
                type: "string",
                description: "Title of the todo (required).",
              },
              description: {
                type: "string",
                description: "Description of the todo (optional).",
              },
            },
            required: ["title"], // Title is required for each todo
          },
        },
      },
      required: ["todos"], // `todos` is a required property of the object
    },
  },
  // searchTodo declaration
  {
    name: "searchTodo",
    parameters: {
      type: "object",
      description:
        "Search todos by a partial string match in title or description and optional status.",
      properties: {
        searchString: {
          type: "string",
          description: "String to search in title or description.",
        },
        status: {
          type: "string",
          description: "Status filter for the todos (optional).",
        },
      },
      required: ["searchString"], // 'searchString' should be required to make the search work
    },
  },

  // updateTodo declaration
  {
    name: "updateTodoById",
    parameters: {
      type: "object",
      description: "Update a todo's title, description, or status by its ID.",
      properties: {
        id: {
          type: "string",
          description: "The ID of the todo to update (required).",
        },
        title: {
          type: "string",
          description: "New title for the todo (optional).",
        },
        description: {
          type: "string",
          description: "New description for the todo (optional).",
        },
        status: {
          type: "string",
          description:
            "New status for the todo (optional) emun {'pending', 'done'}",
        },
      },
      required: ["id"], // 'id' is mandatory to locate the todo
    },
  },
  {
    name: "updateMultipleTodos",
    parameters: {
      type: "object",
      description: "Updates multiple todos by their IDs.",
      properties: {
        updatesArray: {
          type: "array",
          description:
            "Array of objects containing todo IDs and update fields.",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "The ID of the todo to update.",
              },
              updates: {
                type: "object",
                description: "Fields to update for the todo.",
                properties: {
                  title: {
                    type: "string",
                    description: "The new title for the todo.",
                  },
                  description: {
                    type: "string",
                    description: "The new description for the todo.",
                  },
                  status: {
                    type: "string",
                    description: "The new status of the todo.",
                  },
                },
              },
            },
            required: ["id", "updates"],
          },
        },
      },
      required: ["updatesArray"],
    },
  },
  // getAllTodos declaration
  {
    name: "getAllTodos",
    description: "Fetches all todos from the database.",
  },
  //   Delete todos
  {
    name: "deleteTodos",
    parameters: {
      type: "object",
      description: "Deletes multiple todos by their IDs.",
      properties: {
        todoIds: {
          type: "array",
          description: "Array of todo IDs to delete.",
          items: {
            type: "string",
            description: "The ID of a todo to be deleted.",
          },
        },
      },
      required: ["todoIds"],
    },
  },
];
const functions = {
  createTodo: async ({ todos }) => {
    return await createTodo(todos);
  },
  searchTodo: async ({ searchString, status }) => {
    return await searchTodoByStrings(searchString, status);
  },
  updateTodoById: async ({ id, title, description, status }) => {
    return await updateTodoById(id, { title, description, status });
  },
  updateMultipleTodos: async ({ updatesArray }) => {
    return await updateMultipleTodos(updatesArray);
  },
  getAllTodos: async ({ }) => {
    return await getAllTodos();
  },
  deleteTodos: async ({ todoIds }) => {
    return await deleteTodos(todoIds);
  },
};

module.exports = {
  geminiModel,
  systemInstruction,
  functionDeclarations,
  functions,
};
