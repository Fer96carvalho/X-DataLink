const { createClient } = require('@supabase/supabase-js');
const { application } = require ('express');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const connectDatabase = async(app) => {
    try{
        const supabase = createClient(supabaseUrl, supabaseKey);
        console.log('Conectado ao banco de dados PostgreSQL no SupaBase!');
        app.locals.supabase = supabase;
    }catch(err){
        console.log("Ocorreu um erro ao conectar com o banco de dados Supabase: ",err);
    }
}


module.exports = { connectDatabase};

