// Configuração de conexão do Matrimap 2.0 com o Supabase
const SUPABASE_URL = "https://itauaoxhhijuxexnifsj.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0YXVhb3hoaGlqdXhleG5pZnNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4OTYwNjcsImV4cCI6MjEwMzQ3MjA2N30.KMMpiqRSBmqOWal1fj0Q9Gz3Q0WG6k_WU5jMhasPBes";

// Inicialização do Cliente Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
