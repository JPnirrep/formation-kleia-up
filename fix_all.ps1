# Fix ALL Sprint 1 files — Kleia-up frontend
$ErrorActionPreference = "Stop"
$base = "$env:USERPROFILE\Documents\GitHub\formation-kleia-up\frontend\src"
$srv = "http://135.125.53.215:8080"

# .env
Write-Host "[1] .env..."
@"
VITE_GOOGLE_CLIENT_ID=1055786894724-3itekmgdb2b47r8t8thk41cf8m0d28sn.apps.googleusercontent.com
VITE_API_URL=http://localhost:8000
"@ | Set-Content "$base\..\.env" -NoNewline

$files = @(
  @("LoginPage.tsx",          "fix_login_page.tsx"),
  @("RegisterPage.tsx",       "fix_register_page.tsx"),
  @("ForgotPasswordPage.tsx",  "fix_forgot_page.tsx"),
  @("ResetPasswordPage.tsx",   "fix_reset_page.tsx"),
  @("OnboardingPage.tsx",      "fix_onboarding_page.tsx"),
  @("AuthCallback.tsx",        "fix_auth_callback.tsx"),
  @("LandingPage.tsx",         "fix_landing_page.tsx")
)

$i = 2
foreach ($f in $files) {
  $dest = "$base\pages\$($f[0])"
  $url  = "$srv/$($f[1])"
  Write-Host "[$i] $($f[0])..."
  Invoke-WebRequest $url -OutFile $dest
  $i++
}

Write-Host "[$i] App.tsx..."
Invoke-WebRequest "$srv/fix_app.tsx" -OutFile "$base\App.tsx"

Write-Host "[$($i+1)] context/AuthContext.tsx..."
Invoke-WebRequest "$srv/fix_auth_context.tsx" -OutFile "$base\context\AuthContext.tsx"

Write-Host "`n✅ Terminé. Lancement..."
cd $base\..
npm run dev
