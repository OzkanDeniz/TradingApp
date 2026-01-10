import "express-async-errors";
import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";
import cors from "cors";
import connectDB from "./db/connect.js";
import authRouter from "./routes/auth.js";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());

const httpServer = createServer(app);

app.get("/", (req, res) => {
  res.send('<h1>Trading API</h1><a href="/api-docs">Documentation</a>');
});

//SWAGGER API DOCS

const swaggerDocument = YAML.load(join(__dirname, "./docs/swagger.yaml"));
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

//ROUTES

app.use("/auth", authRouter);

//MIDDLEWARES

app.use(cors())
app.use(notFound)
