const express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    NodeCouchDb = require('node-couchdb');
    
const couch = new NodeCouchDb({
    auth: {
        user:'rickmin',
        password:'01234'
    }
});

//http://localhost:5984/customers/_design/all_customers/_view/all?limit=20&reduce=false

const dbName = "customers";
const viewUrl = '_design/all_customers/_view/all';

couch.listDatabases().then(function(dbs){
    console.log(dbs);
});
    
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get("/", function(req, res){
    couch.get(dbName, viewUrl).then(
    function(data, headers, status) {
        console.log(data.data.rows);
        res.render('index',{
            customers:data.data.rows
        });
    },
    function(err){
        res.send(err);
    });
});

app.post('/customer/add', function(req,res){
    const name = req.body.name;
    const email = req.body.email;
    couch.uniqid().then(function(ids){
        const id = ids[0];
        
        couch.insert('customers', {_id:id,
        name:name,
        email:email
        }).then(function(data, headers, status){
            res.redirect('/');
        },
        function(err){
            console.log(err);
        });
    });
});

app.post('/customer/delete/:id', function(req, res){
    const id = req.params.id;
    const rev = req.body.rev;
    
    couch.del(dbName, id, rev).then(function(data, headers, status){
        res.redirect('/');
    },
    function(err) {
        console.log(err);
    });
});

app.listen(3000, ()=>{console.log("Server start on port 3000");});
