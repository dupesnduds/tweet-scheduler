var express = require('express');

var app = express();


app.listen(8080, function() {
  console.log('Server listening on port: ' + this.address().port);
});
