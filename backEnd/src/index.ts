import express from "express";
import appMiddleWare from "./app";
const port =process.env.PORT || 3000;

const app =express();

appMiddleWare(app);



app.listen(port,()=>{
    console.log(`Server is listening on port number : ${port}`)


})