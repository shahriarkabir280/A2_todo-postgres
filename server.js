const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const openapiSpecification = require("./openapi.json");
const { pool, initDb } = require("./db");
const PORT = 3000;
app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

app.get("/", (req,res ) =>{
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"]
  })
})

app.get("/health", (req, res) =>{
    res.json({
      status: "ok"
    })
});


app.get("/tasks", (req, res ) =>{
    res.json(tasks);
})

app.get("/tasks/filter", (req, res) => {
    const wantDone = req.query.done;
    if(wantDone === undefined){
      return res.status(400).json({
        error: "Query parameter 'done' is required."
      })
    }
    const filtered = tasks.filter(t => t.done ===(wantDone === "true"));
    res.json(filtered);
})

app.get("/tasks/:id", (req, res) =>{
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if(task){
    res.json(task);
  }
  else{
    res.status(404).json({
      error: `Task ${id} not found`
    })
  }
})

app.post("/tasks",(req, res) =>{
  const title = req.body.title;
  if(!title){
    return res.status(400).json({
      error: "Title is required."
    })
  }
  const newTask = {
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) +1 : 1,
    title: title,
    done: false
  }
  tasks.push(newTask);
  res.status(201).json(newTask);
})

app.put("/tasks/:id", (req, res) =>{
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if(!task){
    return res.status(404).json({
      error: `Task ${id} not found`
    })
  }
  const title = req.body.title;
  const done =req.body.done;
  if(title != undefined){
    task.title = title;
  }
  if(done != undefined){
    task.done = done;
  }
  res.json(task);
})

app.delete("/tasks/:id", (req, res) =>{
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);
  if(taskIndex === -1){
    return res.status(404).json({
      error: `Task ${id} not found`
    })
  }
  tasks.splice(taskIndex, 1);
  res.status(204).send();
})
