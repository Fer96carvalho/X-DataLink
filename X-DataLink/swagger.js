const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const doc = {
    info: {
        version: "1.0.0",
        title: "X-DataLink API",
        description: "Projeto de Sistemas Distribuídos, X-DataLink, compartilhamento de arquivos."
    },
    servers: [
        {
            url: 'http://localhost:4000'
        }
    ],
    components: {
        schemas: {
            Usuario: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    nome: { type: "string" },
                    email: { type: "string", format: "email", example: "user@example.com" },
                    fotoPerfil: { type: "string", format: "uri" },
                    googleID: { type: "string", nullable: false },
                    criadoEm: { type: "string", format: "date-time" },
                    credencial: { type: "string"}
                }
            },
            Arquivo: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    nome: { type: "string" },
                    tamanho: { type: "string" },
                    tipo: { type: "string" },
                    url: { type: "string", format: "uri" },
                    proprietarioID: { type: "string", format: "uuid" },
                    privado: { type: "boolean" },
                    criadoEm: { type: "string", format: "date-time" }
                }
            },
            Compartilhamento: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    compartilhadoCom: { type: "string", format: "uuid" },
                    permissao: { type: "string", enum: ["Copy", "White"] },
                    arquivoID: { type: "string", format: "uuid" },
                    criadoEm: { type: "string", format: "date-time" }
                }
            },
            Log: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    usuarioID: { type: "string", format: "uuid" },
                    acao: { type: "string" },
                    arquivoID: { type: "string", format: "uuid" },
                    data: { type: "string", format: "date-time" }
                }
            }
        },
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer"
            }
        }
    }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/routes.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./app.js');
});
