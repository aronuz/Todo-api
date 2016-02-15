var express=require('express');
var app=express();
var PORT=process.env.PORT || 3000;

var todos=[{
  id:1,
  description:'meet for lunch',
  completed: false
},
{
  id:2,
  description:'market',
  completed: false
},
{
  id:3,
  description:'feed',
  completed: false
}];

app.get('/', function(req, res){
  res.send('Todo API Root');
});

app.get('/todos', function(req, res){
  res.json(todos);
});

app.get('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo;
  
  todos.forEach(function(todo){
    if(todoId===todo.id){
      matchedTodo=todo;
    }
  });
  
  if(matchedTodo){
    res.json(matchedTodo);
  }else{
    res.status(404).send();
  }
  
  //res.send('Todo item with id '+req.params.id);
});

app.listen(PORT, function(){
  console.log('express listening on port '+PORT);
});