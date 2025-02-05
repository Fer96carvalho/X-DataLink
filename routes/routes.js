const uri = process.env.uri;
const authGoogle = require("../middleware/authGoogle");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//const uploadImageMiddleware = require("./uploadImageMiddleware");
require('dotenv').config()


function configureRoutes(app) {
  // ROTAS DA API
  
  const supabase = app.locals.supabase;

  app.get('/', (req, res) => {
    let origin = req.headers.origin;

    res.json({ origin: "Funcionando!" })
  });

  // Rota de login
  app.post("/login", authGoogle, async (req, res) => {
    const user  = req.user;
    
    try {
      const {error} = await supabase.from('usuarios')
      .insert({ nome: user.nome, email: user.email, fotoPerfil: user.picture, googleId: user.sub });
      console.log(error);

      
      if (error) {
        console.log(error);
        res.status(400).json({ message: "Erro no Supabase!" });
      }else{
        return res.status(200).json({ message: "Login bem-sucedido" });
      }

    } catch (error) {
      console.error("Erro ao se autenticar:", error);
      return res.status(401).json({ mensage: "Erro ao autenticar!" });
    }
  });



  // Rota para lidar com o upload de imagem
  //   app.post("/img/upload", passport.authenticate("jwt", { session: false }), uploadImageMiddleware, async (req, res) => {
  //     try {
  //       const collection = client.db("PPG_Teste").collection("Imagens");
  //       const result = await collection.insertOne(req.novaImagem);

  //       res.status(201).json({
  //         message: "Imagem enviada e salva no MongoDB.",
  //         id: result.insertedId,
  //       });
  //     } catch (err) {
  //       console.error("Erro ao salvar a imagem", err);
  //       res.status(500).json({ nessage: "Erro ao salvar a imagem", err });
  //     }
  //   });

  //   app.use(express.json());
}

module.exports = { configureRoutes };
