import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config(); // Carga las variables del archivo .env

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ruta simple para comprobar que el servidor funciona
app.get("/", (req, res) => {
  res.send("Servidor Email Wizard corriendo 🚀");
});

// Ruta base para las peticiones que crearemos más adelante
app.post("/api/improve", async (req, res) => {
    
  const { emailText, type } = req.body;

  if (!emailText) {
    return res.status(400).json({ error: "No se envió texto para mejorar." });
  }

  try {
    
    const prompt = type === "improve"
      ? `Mejora formalmente este email interno de empresa:\n\n${emailText}`
      : `Resume brevemente este email interno:\n\n${emailText}`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 300
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const message = response.data.choices[0].message.content.trim();
    res.json({ result: message });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Error al conectar con la API de OpenAI." });
    console.log("OPENAI_API_KEY cargada:", process.env.OPENAI_API_KEY);

  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
