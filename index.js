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

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server running on ${process.env.SERVER_PORT} port!`);
});
