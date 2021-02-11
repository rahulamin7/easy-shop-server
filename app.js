const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')
const api = process.env.API_URL;
const productRouter = require('./routers/products');
const categoryRouter = require('./routers/categories');
const userRouter = require('./routers/users');
const orderRouter = require('./routers/orders');

 app.use(cors());
 app.options('*',cors());
//middle ware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))
app.use(errorHandler);

/* app.use(errorHandler); */

app.use(`${api}/products`, productRouter)
app.use(`${api}/categories`, categoryRouter)
app.use(`${api}/users`, userRouter)
app.use(`${api}/orders`, orderRouter)

mongoose.connect(process.env.CONNECTION_STRING,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    dbName: 'eshop-database'
})
.then(()=>{
    console.log('Database connection is ready')
})
.catch((err)=>{
    console.log(err)
});

//Development
/* app.listen(3000, ()=>{
    
    console.log('server is running on http://localhost:3000');
}) */

//Production
var server =  app.listen(process.env.PORT || 3000, function(){
    var port = server.address().port
    console.log("Express in working on port: "+port)
})