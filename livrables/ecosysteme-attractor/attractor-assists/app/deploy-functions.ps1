# deploy-functions.ps1
# Deploie les 3 Edge Functions manquantes sur Supabase
# Projet : lgdgbrivnhgeupqhkckd (attractor-assists, Paris)
#
# PRÉREQUIS :
#   1. Installer Supabase CLI : https://supabase.com/docs/guides/cli/getting-started
#      Avec scoop : scoop install supabase
#      Avec npm   : npm install -g supabase
#   2. Se connecter : supabase login
#   3. Configurer la clé Anthropic dans Supabase :
#      supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxx --project-ref lgdgbrivnhgeupqhkckd
#
# USAGE : .\deploy-functions.ps1

$PROJECT = "lgdgbrivnhgeupqhkckd"

Write-Host "Deploiement des Edge Functions sur le projet $PROJECT..." -ForegroundColor Cyan

supabase functions deploy chat-assistant --project-ref $PROJECT
supabase functions deploy activation-sequence --project-ref $PROJECT
supabase functions deploy analyze-presence --project-ref $PROJECT

Write-Host ""
Write-Host "Deploiement termine. Verifie le dashboard Supabase pour confirmer." -ForegroundColor Green
Write-Host "https://supabase.com/dashboard/project/$PROJECT/functions" -ForegroundColor Yellow
