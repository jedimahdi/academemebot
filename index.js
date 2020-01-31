const { MongoClient } = require("mongodb");
require("dotenv").config();

MongoClient.connect(process.env.MONGO_URL, {
  useNewUrlParser: true
})
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(client => {
    require("./bot")(client);
  });
