const express = require("express");
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');
const app = express();
const cors = require("cors");
require('dotenv').config();
const cookieParser = require('cookie-parser');
const port = process.env.ServerPort;

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  credentials: true,
  preflightContinue: true,
  optionsSuccessStatus: 200,
  allowedHeaders: "Content-Type,Authorization,Origin,X-Requested-With,Accept",
};

app.use(cors(corsOptions));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use(cookieParser('admin@xdatalink.com'));

const { connectDatabase } = require("./database/database");
const { configureRoutes } = require("./routes/routes");

app.use(express.json());

connectDatabase(app); 
configureRoutes(app); 


app.listen(port, () => {
  console.log(`Servidor Express rodando na porta ${port}`);
});
