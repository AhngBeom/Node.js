var express = require('express');
var app = express();

app.locals.pretty = true;
app.set('views', './views');
app.set('view engine', 'pug');
app.listen(3000, () => {
    console.log("Server has been started");
})

app.get("/", (req, res) => {
    res.redirect('/test');
})

app.get("/test", (req, res) => {
    res.render('test', {title : 'Node.js', message  : "Welcome to Node.js"});
})