import express from 'express'

const app =express()

app.post('/start',function(req,res){
   res.end("kek")
})
app.post("/category")
app.post("/subcategory")
app.post("/product")

app.put("/category")
app.put("/subCategory")
app.put("/product")

app.get("/subCategory")
app.get("/category")
app.get("/product")

app.get("/search")

app.listen(3000)