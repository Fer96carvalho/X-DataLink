const authGoogle = require("../middleware/authGoogle");
const multer = require("multer");
require("dotenv").config();

const BUCKET_NAME = process.env.BucketName;
const upload = multer({ storage: multer.memoryStorage() });

function configureRoutes(app) {
    const supabase = app.locals.supabase;

    async function insertLog(supabase, usuarioID, acao, arquivoID) {
        const date = new Date();
        const { data, error } = await supabase
            .from("Logs")
            .insert([
                {
                    'usuarioID': usuarioID,
                    'acao': acao,
                    'arquivoID': arquivoID,
                    'data': date
                },
            ], { onConflict: ["usuarioID", "acao", "data"] })
            .select();

        if (error) {
            console.error("Erro ao inserir log:", error);
            return null;
        }

        console.log("Log do sistema => ", date, "\nDados do log:", data);
        return data;
    }

    //Teste de RunTime
    app.get("/", (req, res) => {
        res.json({ origin: "Funcionando!" });
    });

    //Login com Google
    app.post("/login", authGoogle, async (req, res) => {
        const user = req.user;

        try {
            const { data: userDB, error: Error } = await supabase
                .from("Usuarios")
                .select()
                .eq("googleID", user.sub)
                .single();

            if (Error && Error.code !== "PGRST116") {
                console.error("Erro ao buscar usuário:", Error);
                return res.status(400).json({ message: "Erro ao verificar usuário no banco!" });
            }

            if (userDB) {
                insertLog(supabase, userDB.id, `Login 2 do usuário ${userDB.nome}`, null);
                return res.status(200).json({ message: "Login bem-sucedido", data: userDB });
            }

            const { data, error } = await supabase
                .from("Usuarios")
                .upsert([{ nome: user.name, email: user.email, fotoPerfil: user.picture, googleID: user.sub }], { onConflict: ["googleID"] })
                .select();

            if (data) {
                insertLog(supabase, data[0].id, `Cadastro de novo usuário: ${data[0].nome}`, null);
                insertLog(supabase, userDB.id, `Login do usuário ${data[0].nome}`, null);
                return res.status(200).json({ message: "Cadastro e Login realizado com sucesso!", data });
            }

            if (error) {
                console.error("Erro ao inserir usuário no Supabase:", error);
                return res.status(400).json({ message: "Erro ao inserir usuário", error });
            }


        } catch (error) {
            console.error("Erro ao se autenticar:", error);
            return res.status(401).json({ message: "Erro ao autenticar!" });
        }
    });

    //Upload de Arquivo
    app.post("/uploadData", authGoogle, upload.single("file"), async (req, res) => {
        const user = req.user;
        if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });

        const { data: userDB, error: checkError } = await supabase
            .from("Usuarios")
            .select()
            .eq("googleID", user.sub)
            .single();

        if (checkError && checkError.code !== "PGRST116") {
            console.error("Erro ao buscar usuário:", checkError);
            return res.status(400).json({ message: "Erro ao verificar usuário no banco!" });
        }

        const fileNameNormalize = (fileName) => {
            return fileName
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "_")
                .replace(/[^a-zA-Z0-9_.-]/g, "");
        };


        const fileName = req.file.originalname;
        const encodedFileName = fileNameNormalize(fileName);

        try {
            const filePath = `${user.sub}/${encodedFileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, req.file.buffer, {
                contentType: req.file.mimetype,
            });


            if (uploadError) return res.status(500).json({ message: 'Erro no upload', error: uploadError.message });


            if (userDB && uploadData) {
                const { data: arquivo, error: Error } = await supabase
                    .from("Arquivos")
                    .upsert([{
                        nome: req.file.originalname,
                        tamanho: req.file.size,
                        tipo: req.file.mimetype,
                        url: filePath,
                        proprietarioID: userDB.id
                    }]).select();

                if (uploadData && arquivo) insertLog(supabase, userDB.id, `Upload do arquivo ${arquivo[0].nome} para o Bucket`, arquivo[0].id);

                if (arquivo) {
                    insertLog(supabase, userDB.id, `Arquivo ${arquivo[0].nome} salvo no banco de dados`, arquivo[0].id);
                    return res.json({ message: "Upload realizado com sucesso!" });
                }

                if (Error) return res.status(500).json({ message: 'Erro no banco de dados', error: Error.message });

            }
        } catch (error) {
            return res.status(500).json({ messagem: 'Erro no servidor', error: error });
        }
    });

    //Mudar privacidade do arquivo
    app.post("/changePrivacy/:fileID", authGoogle, async (req, res) => {
        const user = req.user;
        const fileID = req.params.fileID;

        const { data: userDB, error: error } = await supabase.from("Usuarios").select().eq("googleID", user.sub).single();


        const { data: arquivo, error: erro } = await supabase.from("Arquivos").select().eq("proprietarioID", userDB.id).eq("id", fileID).single();
        console.log("Arquivo", arquivo)


        if (erro) {
            return res.status(500).json({ message: 'Erro ao buscar os dados no Supabase', error: erro.message });
        }

        try {
            const { data, error } = await supabase.from("Arquivos").update({ 'privado': !arquivo.privado }).eq("id", fileID).eq("proprietarioID", userDB.id).select();


            if (error) {
                return res.status(500).json({ message: 'Erro ao atualizar os dados no Supabase', error: error.message });
            }

            if (data && arquivo) {
                insertLog(supabase, userDB.id, `Usuário ${userDB.nome} alterou a privacidade do arquivo ${arquivo.nome} para ${!arquivo.privado}`, fileID);
                res.status(200).json({ message: 'Privacidade atualizada com sucesso' });
            }



        } catch (error) {
            res.status(500).json({ message: 'Erro ao atualizar privacidade', error: error.message });
        }
    });

    //Copiar arquivo compartilhado com permissão de Copy
    app.get("/copyFile/:fileID", authGoogle, async (req, res) => {
        const user = req.user;
        const fileID = req.params.fileID;

        try {
            const { data: userDB, error: error } = await supabase
                .from("Usuarios")
                .select()
                .eq("googleID", user.sub)
                .single();

            const { data: userPemission, error: checkError } = await supabase.from("Compartilhamentos").select('permissao').eq("arquivoID", fileID).eq("compartilhadoCom", userDB.id)
                .single();

            if (userPemission && userPemission.permissao != "Copy") {
                return res.status(403).json({ error: "Você não tem permissão para copiar este arquivo!" });
            }

            const { data: originalFile, error: fetchError } = await supabase.from("Arquivos")
                .select("*").eq("id", fileID);

            console.log(originalFile)

            if (fetchError) {
                return res.status(404).json({ error: "Arquivo não encontrado", fileID: fileID });
            }



            if (originalFile[0].proprietarioID == userDB.id) {
                return res.status(403).json({ error: " Vocé nao pode copiar um arquivo que você criou!" });
            }
            const oldPath = originalFile[0].url;
            const newPath = `${user.sub}/${originalFile[0].nome}`;
            console.log("Source Key:", typeof oldPath, oldPath);
            console.log("Destination Key:", typeof newPath, newPath);
            console.log("Usuário:", user);
            console.log("Arquivo Original:", originalFile);
            console.log("Caminho Antigo:", oldPath);
            console.log("Caminho Novo:", newPath);



            const { data: copyData, error: copyError } = await supabase
                .storage
                .from(BUCKET_NAME)
                .copy(oldPath , newPath);


            if (copyData) {
                insertLog(supabase, userDB.id, `Usuário ${userDB.nome} copiou o arquivo ${originalFile[0].nome}`, fileID);
            }
            if (copyError) {
                return res.status(500).json({ error: "Erro ao copiar arquivo", details: copyError });
            }

            const { data: arquivoCopy, error: insertError } = await supabase
                .from("Arquivos")
                .insert({
                    nome: originalFile[0].nome,
                    url: newPath,
                    tipo: originalFile[0].tipo,
                    tamanho: originalFile[0].tamanho,
                    proprietarioID: userDB.id,
                }).select();

            if (arquivoCopy) {
                insertLog(supabase, userDB.id, `Copia do arquivo ${originalFile[0].nome} inserida no banco de dados`, fileID);
            }

            if (insertError) {
                return res.status(500).json({ error: "Erro ao registrar cópia no banco" });
            }
            return res.status(200).json({
                message: "Arquivo copiado com sucesso!"
            });
        } catch (error) {
            return res.status(500).json({ error: "Erro interno", details: error.message });
        }
    }
    );

    //Gerar URL para Download
    app.get("/download/:fileID", authGoogle, async (req, res) => {
        const user = req.user;
        const fileID = req.params.fileID;

        const { data: userDB, error: Error } = await supabase
            .from("Usuarios")
            .select()
            .eq("googleID", user.sub)
            .single();


        const { data: fileDB, error: error } = await supabase.from("Arquivos").select().eq("id", fileID).single();

        try {
            const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(fileDB.url, 60);

            if (data) {
                insertLog(supabase, userDB.id, `Usuário ${userDB.nome} baixou o arquivo ${fileDB.nome}`, fileID);
            }

            if (error) return res.status(400).json({ message: 'Arquivo não encontrado ou não existe', error: error.message });

            res.json({ downloadUrl: data.signedUrl });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao gerar URL', error: error.message });
        }
    });

    // Deletar arquivo
    app.delete("/delete/:fileID", authGoogle, async (req, res) => {
        const user = req.user;
        const fileID = req.params.fileID;

        try {
            const { data: userDB, error: userError } = await supabase
                .from("Usuarios")
                .select()
                .eq("googleID", user.sub)
                .single();

            if (userError) throw new Error(userError.message);

            const { data: filePath, error: fileError } = await supabase
                .from("Arquivos")
                .select()
                .eq("proprietarioID", userDB.id)
                .eq("id", fileID)
                .single();

            if (fileError || !filePath) {
                return res.status(404).json({ message: "Arquivo não encontrado", error: fileError?.message });
            }

            // Deletando os compartilhamentos
            const { error: shareError } = await supabase
                .from("Compartilhamentos")
                .delete()
                .eq("arquivoID", fileID);

            if (shareError) throw new Error(shareError.message);

            insertLog(supabase, userDB.id, `Usuário ${userDB.nome} iniciou o processo para deletar o arquivo ${filePath.nome}`, fileID);
            insertLog(supabase, userDB.id, `Dados do arquivo ${filePath.nome} foram deletados da tabela Compartilhamentos`, fileID);

            // Deletando o arquivo da tabela Arquivos
            const { error: dbError } = await supabase
                .from("Arquivos")
                .delete()
                .eq("proprietarioID", userDB.id)
                .eq("id", fileID);

            if (dbError) throw new Error(dbError.message);

            insertLog(supabase, userDB.id, `Dados do arquivo ${filePath.nome} foram deletados da tabela Arquivos`, fileID);

            // Deletando o arquivo do bucket do Supabase
            const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([filePath.url]);

            if (storageError) throw new Error(storageError.message);

            insertLog(supabase, userDB.id, `Arquivo ${filePath.nome} deletado do Bucket`, fileID);
            insertLog(supabase, userDB.id, `Usuário ${userDB.nome} deletou o arquivo ${filePath.nome}`, fileID);

            return res.json({ message: "Arquivo deletado com sucesso!" });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        }
    });

    // Buscar arquivos publicos
    app.get("/searchPublicFiles/:fileName", authGoogle, async (req, res) => {
        const user = req.user;
        const fileName = req.params.fileName;

        const { data: userDB, error: error } = await supabase
            .from("Usuarios")
            .select()
            .eq("googleID", user.sub)
            .single();

        try {

            if (fileName == "all") {
                const { data: arquivos, error } = await supabase
                    .from("Arquivos")
                    .select("id, nome, url, proprietarioID, criadoEm, tamanho, Usuarios(id, nome)").eq("privado", false)

                if (error) {
                    return res.status(500).json({ error: "Erro ao buscar arquivos", details: error });
                }
                return res.status(200).json({ arquivos });
            } else {

                const { data: arquivos, error } = await supabase
                    .from("Arquivos")
                    .select("id, nome, url, proprietarioID, criadoEm, tamanho, Usuarios(id, nome)").eq("privado", false)
                    .ilike("nome", `%${fileName}%`);

                if (error) {
                    return res.status(500).json({ error: "Erro ao buscar arquivos", details: error });
                }

                if (!arquivos.length) {
                    return res.status(404).json({ error: "Nenhum arquivo encontrado" });
                }

                return res.status(200).json({ arquivos });
            }
        } catch (error) {
            return res.status(500).json({ error: "Erro interno", details: error.message });
        }
    });

    //Listar Arquivos do Usuário
    app.get("/userFiles", authGoogle, async (req, res) => {
        const user = req.user;

        const { data: userDB, error: checkError } = await supabase
            .from("Usuarios")
            .select()
            .eq("googleID", user.sub)
            .single();

        if (checkError && checkError.code !== "PGRST116") {
            console.error("Erro ao buscar usuário:", checkError);
            return res.status(400).json({ message: "Erro ao verificar usuário no banco!" });
        }

        try {
            const { data, error } = await supabase.from("Arquivos").select("*").eq("proprietarioID", userDB.id);

            if (error) return res.status(500).json({ error: error.message });

            res.json({ data, userID: userDB.id });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });

    // Compartilhar arquivo pelo email
    app.post("/shareFile", authGoogle, async (req, res) => {
        const user = req.user;
        const { fileID, userEmail } = await req.body;

        if (!fileID || !userEmail) {
            return res.status(400).json({ message: "Parâmetros inválidos!" });
        }

        try {

            const { data: userDB, error: userError } = await supabase
                .from("Usuarios")
                .select()
                .eq("googleID", user.sub)
                .single();

            if (userError) {
                return res.status(400).json({ message: "Erro ao verificar usuário!" });
            }


            const { data: fileDB, error: fileError } = await supabase
                .from("Arquivos")
                .select()
                .eq("id", fileID)
                .single();

            if (fileError || !fileDB) {
                return res.status(404).json({ message: "Arquivo não encontrado!" });
            }

            if (fileDB.proprietarioID !== userDB.id) {
                return res.status(403).json({ message: "Você não tem permissão para compartilhar este arquivo!" });
            }


            const { data: sharedUser, error: sharedUserError } = await supabase
                .from("Usuarios")
                .select("id")
                .eq("email", userEmail)
                .single();

            if (sharedUserError || !sharedUser) {
                return res.status(404).json({ message: "Usuário não encontrado!" });
            }


            const { error: shareError } = await supabase.from("Compartilhamentos").upsert([
                {
                    arquivoID: fileID,
                    compartilhadoCom: sharedUser.id,
                    permissao: "Copy",
                },
            ]);

            if (shareError) {
                return res.status(500).json({ message: "Erro ao compartilhar arquivo!", error: shareError.message });
            } else {
                insertLog(supabase, userDB.id, `Arquivo ${fileDB.nome} compartilhado com ${userDB.nome}`, fileID);
            }

            return res.status(200).json({ message: "Arquivo compartilhado com sucesso!" });
        } catch (error) {
            return res.status(500).json({ message: "Erro interno", error: error.message });
        }
    });

    // Listar arquivos compartilhados com o usuário
    app.get("/sharedFiles", authGoogle, async (req, res) => {
        const user = req.user;

        try {
            const { data: userDB, error: userError } = await supabase
                .from("Usuarios")
                .select("id")
                .eq("googleID", user.sub)
                .single();

            if (userError) {
                console.error("Erro ao buscar usuário:", userError);
                return res.status(400).json({ message: "Erro ao verificar usuário no banco!" });
            }

            const { data: sharedFiles, error: sharedError } = await supabase
                .from("Compartilhamentos")
                .select(`
                    id,
                    permissao,
                    criadoEm,
                    Arquivos (
                    id,
                    nome,
                    url,
                    tipo,
                    tamanho,
                    privado,
                    criadoEm,
                    Usuarios:proprietarioID ( id, nome, email, fotoPerfil )
                    )
                    `).eq("compartilhadoCom", userDB.id);

            // const { data: sharedFiles, error: sharedError } = await supabase
            //     .from("Compartilhamentos")
            //     .select("* , Arquivos(*), Usuarios(*)")
            //     .eq("compartilhadoCom", userDB.id)

            if (sharedError) {
                console.error("Erro ao buscar arquivos compartilhados:", sharedError);
                return res.status(500).json({ message: "Erro ao buscar arquivos compartilhados!" });
            }

            return res.status(200).json(sharedFiles);
        } catch (error) {
            console.error("Erro interno:", error);
            return res.status(500).json({ message: "Erro interno ao buscar arquivos compartilhados!" });
        }
    });

    //Listar Logs do sistema
    app.get("/logs", async (req, res) => {
        try {
            const { data: logs, error } = await supabase
                .from("Logs").select();

            if (error) {
                return res.status(500).json({ message: "Erro ao buscar os Logs", error });
            }

            res.status(200).json(logs);
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar os Logs", error });
        }
    });

}

module.exports = { configureRoutes };
