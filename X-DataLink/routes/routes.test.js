const request = require('supertest');
const express = require('express');
const { configureRoutes } = require('./routes');
const authGoogle = require('../middleware/authGoogle');
const multer = require('multer');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
app.locals.supabase = supabase;

configureRoutes(app);

jest.mock('../middleware/authGoogle', () => jest.fn((req, res, next) => {
    req.user = { sub: 'test-google-id', name: 'Test User', email: 'test@example.com', picture: 'test-picture-url' };
    next();
}));

describe('Routes', () => {
    it('Deve retornar mensagem "Funcionando!" em GET /', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ origin: 'Funcionando!' });
    });

    // Requer o frontend para testar a rota
    // it('Deve fazer login com Google em POST /login', async () => {
    //     const res = await request(app).post('/login');
    //     expect(res.statusCode).toEqual(200);
    //     expect(res.body.message).toEqual('Login bem-sucedido');
    // });

    // Requer login no frontend para testar a rota
    // it('Deve fazer upload de um arquivo em POST /uploadData', async () => {
    //     const res = await request(app)
    //         .post('/uploadData')
    //         .attach('file', Buffer.from('test file content'), 'test.txt');
    //     expect(res.statusCode).toEqual(200);
    //     expect(res.body.message).toEqual('Upload realizado com sucesso!');
    // });

    // Requer login no frontend para testar a rota
    // it('Deve alterar a privacidade de um arquivo POST /changePrivacy/:fileID', async () => {
    //     const res = await request(app).post('/changePrivacy/1');
    //     expect(res.statusCode).toEqual(200);
    //     expect(res.body.message).toEqual('Privacidade atualizada com sucesso');
    // });

    // Requer login no frontend para testar a rota
    // it('Deve copiar um arquivo em GET /copyFile/:fileID', async () => {
    //     const res = await request(app).get('/copyFile/1');
    //     expect(res.statusCode).toEqual(200);
    //     expect(res.body.message).toEqual('Arquivo copiado com sucesso!');
    // });

    // Requer login no frontend para testar a rota
    // it('DEve gerar um link de download on GET /download/:fileID', async () => {
    //     const res = await request(app).get('/download/1');
    //     expect(res.statusCode).toEqual(200);
    //     expect(res.body).toHaveProperty('downloadUrl');
    // });

    // Requer login no frontend para testar a rota
    // it('Deve apagar um arquivo em DELETE /delete/:fileID', async () => {
    //     const res = await request(app).delete('/delete/1');
    //     expect(res.statusCode).toEqual(200);
    //     expect(res.body.message).toEqual('Arquivo deletado com sucesso!');
    // });

    // Requer login no frontend para testar a rota
    // it('Deve bucar arquivos publicos em GET /searchPublicFiles/:fileName', async () => {
    //     const res = await request(app).get('/searchPublicFiles/test');
    //     expect(res.statusCode).toEqual(200);
    //     expect(res.body).toHaveProperty('arquivos');
    // });

    it('Deve listar os arquivos do usuário em GET /userFiles', async () => {
        const res = await request(app).get('/userFiles');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('data');
    });

    // Requer login no frontend e dados válidos para testar a rota
    // it('DEve compartilhar um arquivo com outro usuário em POST /shareFile', async () => {
    //     const res = await request(app)
    //         .post('/shareFile')
    //         .send({ fileID: 1, userEmail: 'share@example.com' });
    //     expect(res.statusCode).toEqual(200);
    //     expect(res.body.message).toEqual('Arquivo compartilhado com sucesso!');
    // });

    it('Deve listar os arquivos compartilhados em GET /sharedFiles', async () => {
        const res = await request(app).get('/sharedFiles');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('length');
    });

    it('Deve listar logs em GET /logs', async () => {
        const res = await request(app).get('/logs');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('length');
    });
});