const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

const { mrcongRoutes } = require("./routes");
const app = express();

dotenv.config();

app.use(cors());
app.use(morgan("common"));

// Routes
app.use("/api", mrcongRoutes);

const port = process.env.SERVER_PORT || 11000;

app.listen(port, () => {
  console.log(`Server running on ${port} port!`);
});
