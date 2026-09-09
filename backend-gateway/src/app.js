const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { connectMongo } = require("./services/mongo.service");
const { connectRedis } = require("./services/cache.service");
const modelDataRoutes = require("./routes/modelData.routes");
const argoRoutes = require("./routes/argo.routes");
const gliderRoutes = require("./routes/glider.routes");
const userViewsRoutes = require("./routes/userViews.routes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api", limiter);

app.use("/api/model-data", modelDataRoutes);
app.use("/api/argo", argoRoutes);
app.use("/api/glider", gliderRoutes);
app.use("/api/views", userViewsRoutes);

app.use(errorHandler);

async function start() {
  await connectMongo();
  await connectRedis();
  app.listen(process.env.PORT || 4000, () => {
    console.log(`Gateway running on port ${process.env.PORT || 4000}`);
  });
}

module.exports = app;

if (require.main === module) {
  start();
}