const express = require("express");
let app  = express();

app.set("view engine","ejs");
app.use(express.static("public"));


app.get("/cv",(req,res)=>{
    res.render("cv");
})

app.get("/",(req,res)=>{
    res.render("home");
})

app.listen(3000,() => {
    console.log("Server started at location: 5000")
})


















// const express = require("express");
// let app  = express();

// app.get("/contact-us",(req,res)=>{
//     res.send("<h1> Hello Section B Contact</h1>")
// })

// app.get("/",(req,res)=>{
//     res.send("<h1> Hello Section A Home</h1>")
// })

// app.get("/update",(req,res)=>{
//     res.send("<h1> Hello Section update</h1>")
// })
// app.get("/create",(req,res)=>{
//     res.send("<h1> Hello create</h1>")
// })

// app.listen(5001,() => {
//     console.log("Server started at location: 5001")
// })