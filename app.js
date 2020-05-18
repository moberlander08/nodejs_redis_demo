const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

//Redis Client
var client = redis.createClient('6379', '172.17.0.2' );

client.on('connect', function(){
  console.log('Connected to Redis...');
});

//Set Port
const port = 8080;

//Init app
const app = express();

//View Engine\
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//methodOverride
app.use(methodOverride('_method'));

//Search Page
app.get('/', function(reg, res, next){
  res.render('searchusers');
});

//Search Proccessing
app.post('/user/search', function(req, res, next){
  var id = req.body.id;

  client.hgetall(id, function(err, obj){
    if(!obj){
      res.render('searchusers', {
      error: 'User does not exist'});
    } else {
    obj.id = id;
    res.render('details', {
      user: obj});
      } //end if
    }); //end elseif
});

//Add User Page
app.get('/user/add', function(reg, res, next){
  res.render('adduser');
});

//Process Add User Page
app.post('/user/add', function(req, res, next){
  var id = req.body.id;
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var email = req.body.email;
  var phone = req.body.phone;

  client.hmset(id, [
    'first_name', first_name,
    'last_name', last_name,
    'email', email,
    'phone', phone],
    function(err, reply){
      if(err){
        console.log(err);
      }
      console.log(reply);
      res.redirect('/');
  });//client.hmset
});//app.post


//Delete User 
app.delete('/user/delete/:id', function(req, res, next){
  client.del(req.params.id);
  res.redirect('/');
});
app.listen(port, function(){
  console.log('Server started on port '+port);
});
