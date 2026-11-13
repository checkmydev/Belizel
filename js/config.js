// Configuration publique. La clé « anon » Supabase est publique par conception (protégée par les règles RLS du schéma belizel).
// Clé vide → mode démo : l'application utilise les fichiers locaux de data/ et le stockage du navigateur.
window.BELIZEL_CONFIG = {
  supabaseUrl: 'https://wzrcrszfubjsfoaxatvo.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cmNyc3pmdWJqc2ZvYXhhdHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMjcxMzEsImV4cCI6MjA5MTcwMzEzMX0.HSzERXdF0nBs0L4XVcKo-UsGe1PAcqiVD5gwZj15foY',
  schema: 'belizel'
};
