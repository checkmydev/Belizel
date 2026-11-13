// Configuration publique. La clé « anon » Supabase est publique par conception (protégée par les règles RLS du schéma belizel).
// Clé vide → mode démo : l'application utilise les fichiers locaux de data/ et le stockage du navigateur.
window.BELIZEL_CONFIG = {
  supabaseUrl: 'https://wzrcrszfubjsfoaxatvo.supabase.co',
  anonKey: '',
  schema: 'belizel'
};
