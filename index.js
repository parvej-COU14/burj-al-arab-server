const express = require('express')
const bodyParser = require('body-parser');
const cors=require('cors');
require('dotenv').config()
// console.log(process.env.DB_USER);
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1nfqp.mongodb.net/Burj-server?retryWrites=true&w=majority`;


const app = express()
app.use(cors());
app.use(bodyParser.json());

const pass="PARVEJMOSHARAF22"

const admin = require("firebase-admin");

var serviceAccount = require("./burj-al-arab-de3cf-firebase-adminsdk-w4i4t-4e417a821a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});







const client = new MongoClient(uri,{ useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
client.connect(err => {
  const bookings = client.db("Burj-server").collection("hotelBooking");
  app.post('/addBooking',(req,res)=>{
    const newBooking=req.body;
    bookings.insertOne(newBooking)
    .then(result=>{
       res.send(result.insertedCount>0)
    })
    // console.log(newBooking)
})

 app.get('/bookings',(req,res)=>{
   const bearer=req.headers.authorization;
   if (bearer && bearer.startsWith('Bearer ')){
     const idToken=bearer.split (' ')[1];
    //  console.log({idToken});
        // idToken comes from the client app
          admin
          .auth()
          .verifyIdToken(idToken)
          .then((decodedToken) => {
            const tokenEmail = decodedToken.email;
            const queryEmail=req.query.email
            
            if(tokenEmail== queryEmail){
              bookings.find({email: req.query.email})
              .toArray((err,documents)=>{
                res.status(200).send(documents)
              })   

            
          }
          else{
            res.status(401).send('un-authorized access');
          }
          })
          .catch((error) => {
            res.status(401).send('un-authorized access');
          });

        }
          else{

            res.status(401).send('un-authorized access');

          }
        })

          // client.close();
        });
app.listen(5000);
