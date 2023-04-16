const express = require('express');
const mongoose = require('mongoose');
const route = require('./src/routes');

const app = express();
app.use(express.json());

require('dotenv').config()
mongoose.set('strictQuery', true);
mongoose
  .connect(
    process.env.DATABASE,
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log('MongoDb is connected'))
  .catch((err) => console.log(err));

app.use('/', route);

app.use('/*',(req,res)=>{
  res.status(404).send('you are getting in the wrong path 😥')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`server is connected with port no. ${PORT}`);
});