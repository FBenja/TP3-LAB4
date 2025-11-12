import express from "express";
import cors from "cors";
import { conectarDB } from "./db.js";
import authRouter from "./src/routes/auth.route.js";
import { authConfig } from "./src/middlewares/auth.middleware.js";

conectarDB();

const app = express();
const port = 3000;

// Para interpretar body como JSON
app.use(express.json());
// Habilito CORS
app.use(cors());

authConfig()



app.get("/", (req, res) => {
  // Responder con string
  res.send("Hola mundo!");
});

app.use('/api/auth', authRouter);


app.listen(port, () => {
  console.log(`La aplicación esta funcionando en el puerto ${port}`);
});