const express =require('express');
const app= express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors= require('cors');
require('dotenv').config()
const port =process.env.PORT || 3500;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bescutn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const productCollections = client.db("productsDB").collection("products");
    const CardProductCollections = client.db("productsDB").collection("CardProducts");

     //------------------------------Items related API--------------------------------------
           //Get form server
    app.get('/products',async(req,res)=>{
        const cursor =productCollections.find();
        const result =await cursor.toArray();
        res.send(result);
    })
    //Update from server
    app.get('/products/:id',async(req,res)=>{
        const id = req.params.id;
        const query={_id: new ObjectId(id)};
        const result= await productCollections.findOne(query);
        res.send(result);
    })
        //POST to server
        app.post('/products',async(req,res)=>{
            const  newProducts= req.body;
      
            const result= await productCollections.insertOne(newProducts);
            res.send(result);
        })
       
            //update the database
    app.put('/products/:id', async(req,res)=>{
        const id =req.params.id;
        console.log(id);
        const filter={_id: new ObjectId(id)};
        const options = { upsert: true };
        const updatedProduct=req.body;
        const newUpdatedProduct={
            $set: {
                name:updatedProduct.name ,
                bandName:updatedProduct. bandName ,
                rating:updatedProduct.rating, 
                price:updatedProduct.price ,
                type:updatedProduct.type,
                description:updatedProduct.description, 
                photo:updatedProduct.photo
              },
        }
        const result= await productCollections.updateOne(filter,newUpdatedProduct,options);
        res.send(result);
    })
// add cart items
    app.post('/users',async(req,res)=>{
      const user= req.body;
      const result =await CardProductCollections.insertOne(user);
      console.log("items added")
      res.send(result);

  })
   //get the user
   app.get('/users',async(req,res)=>{
    const cursor =CardProductCollections.find();
    const result =await cursor.toArray();
    res.send(result);
})
   //delete a user
   app.delete('/users/:id',async(req,res)=>{
    const id = req.params.id;
    const query={_id: new ObjectId(id)}
    const result= await CardProductCollections.deleteOne(query);
    res.send(result)
})


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
 
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Add product server is running')
})

app.listen(port,()=>{
    console.log(`App working in the port no ${port}`)
})