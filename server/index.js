import express from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./db/db.js";
import userRouter from "./routes/userRoute.js"; 



const PORT = process.env.PORT || 5000;
// Initialize the Express application
const app = express();
app.use(bodyParser.json());

// Set up middlewares
app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json()); 



  app.use("/api/user", userRouter)

app.get("/", (req,res)=> {
    res.send("api working")
})

// Connect to the database and start the server
connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

  }).catch(err => {
    console.error("Failed to connect to the database", err);
  });