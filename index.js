const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const PORT = process.env.PORT || 3000;
dotenv.config();
const app = express();
// Config routes
const categoryRouter = require("./routes/category");
const productRouter = require("./routes/product");
const userRouter = require("./routes/user");
const billRouter = require("./routes/bill");
const billDetailRouter = require("./routes/billDetail");
const colorRouter = require("./routes/color");
const sizeRouter = require("./routes/sizes");
const commentsRouter = require("./routes/comment");
const productDetailsSchema = require("./routes/productDetail");
const couponRouter = require("./routes/coupon");
mongoose.connect(process.env.MONGDB_URL, (err) => {
  if (err) {
    console.log("Can't connect to database");
  } else {
    console.log("Connected to mongodb");
  }
});
console.log(process.env.MONGDB_URL, "mongodb");
app.use(
  bodyParser.json({
    limit: "50mb",
  })
);
app.use(cors());
app.use(morgan("common"));

app.use("/api/categories", categoryRouter);

app.use("/api/products", productRouter);

app.use("/api/users", userRouter);

app.use("/api/bills", billRouter);

app.use("/api/bill-details", billDetailRouter);

app.use("/api/colors", colorRouter);

app.use("/api/sizes", sizeRouter);

app.use("/api/comments", commentsRouter);
//
app.use("/api/product-details", productDetailsSchema);
app.use("/api/coupons", couponRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
