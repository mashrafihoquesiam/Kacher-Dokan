$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envPath = Join-Path $projectDir '.env'

function Read-EnvFile($path) {
    $map = @{}
    if (Test-Path $path) {
        Get-Content $path | ForEach-Object {
            $line = $_.Trim()
            if ($line -and -not $line.StartsWith('#') -and $line.Contains('=')) {
                $parts = $line.Split('=', 2)
                $map[$parts[0].Trim()] = $parts[1].Trim()
            }
        }
    }
    return $map
}

function Parse-MongoUri($uri) {
    $r = @{ User=''; Host=''; Db=''; Query='' }
    if (-not $uri) { return $r }
    $m = [regex]::Match($uri, '^mongodb\+srv://(?<user>[^:]+):(?<pass>[^@]*)@(?<host>[^/?]+)(?<path>/[^?]*)?(?<query>\?.*)?$')
    if ($m.Success) {
        try { $r.User = [uri]::UnescapeDataString($m.Groups['user'].Value) } catch { $r.User = $m.Groups['user'].Value }
        $r.Host = $m.Groups['host'].Value
        $pathPart = $m.Groups['path'].Value
        if ($pathPart -and $pathPart.Length -gt 1) { $r.Db = $pathPart.TrimStart('/') }
        $r.Query = $m.Groups['query'].Value
    }
    return $r
}

function Read-WithDefault($label, $defaultValue) {
    if ($defaultValue) {
        $v = Read-Host "$label [$defaultValue]"
        if ([string]::IsNullOrWhiteSpace($v)) { return $defaultValue }
        return $v.Trim()
    }
    return (Read-Host $label).Trim()
}

Write-Host ''
Write-Host '=====================================================' -ForegroundColor Cyan
Write-Host '      KACHER DOKAN - MONGODB ATLAS SETUP' -ForegroundColor Cyan
Write-Host '=====================================================' -ForegroundColor Cyan
Write-Host 'This setup writes the connection only to your local .env file.'
Write-Host 'Your password is not printed on the screen.'
Write-Host ''

$current = Read-EnvFile $envPath
$currentParsed = Parse-MongoUri $current['MONGO_URI']

Write-Host 'In MongoDB Atlas open: Cluster0 > Connect > Drivers.' -ForegroundColor Yellow
Write-Host 'Copy the connection string. It can still contain <db_password>.' -ForegroundColor Yellow
Write-Host ''
$template = Read-Host 'Paste the Atlas connection string, or press Enter to use the current .env user/host'
$templateParsed = Parse-MongoUri $template

$defaultUser = if ($templateParsed.User) { $templateParsed.User } else { $currentParsed.User }
$defaultHost = if ($templateParsed.Host) { $templateParsed.Host } else { $currentParsed.Host }
$defaultDb = if ($current['DB_NAME']) { $current['DB_NAME'] } elseif ($templateParsed.Db) { $templateParsed.Db } elseif ($currentParsed.Db) { $currentParsed.Db } else { 'kaser_dokan' }
$defaultQuery = if ($templateParsed.Query) { $templateParsed.Query } elseif ($currentParsed.Query) { $currentParsed.Query } else { '?retryWrites=true&w=majority&appName=Cluster0' }

$user = Read-WithDefault 'Atlas database username' $defaultUser
$hostName = Read-WithDefault 'Atlas cluster host (example: cluster0.xxxxx.mongodb.net)' $defaultHost
$dbName = Read-WithDefault 'Database name' $defaultDb

if ([string]::IsNullOrWhiteSpace($user) -or [string]::IsNullOrWhiteSpace($hostName)) {
    Write-Host 'Username or cluster host is missing. Setup cancelled.' -ForegroundColor Red
    exit 1
}

$securePassword = Read-Host 'Current Atlas DATABASE USER password' -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}
if ([string]::IsNullOrEmpty($plainPassword)) {
    Write-Host 'Password cannot be empty.' -ForegroundColor Red
    exit 1
}

$encUser = [uri]::EscapeDataString($user)
$encPassword = [uri]::EscapeDataString($plainPassword)
$plainPassword = $null
if (-not $defaultQuery.StartsWith('?')) { $defaultQuery = '?' + $defaultQuery.TrimStart('?') }
$mongoUri = "mongodb+srv://${encUser}:${encPassword}@${hostName}/${dbName}${defaultQuery}"

$port = if ($current['PORT']) { $current['PORT'] } else { '3000' }
$paymentMode = if ($current['PAYMENT_MODE']) { $current['PAYMENT_MODE'] } else { 'demo' }
$authSecret = $current['AUTH_SECRET']
if (-not $authSecret -or $authSecret -eq 'change-this-to-a-long-random-secret') {
    $authSecret = ([guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N'))
}
$bnVoice = if ($current['EDGE_TTS_BN_VOICE']) { $current['EDGE_TTS_BN_VOICE'] } else { 'bn-BD-NabanitaNeural' }
$enVoice = if ($current['EDGE_TTS_EN_VOICE']) { $current['EDGE_TTS_EN_VOICE'] } else { 'en-US-JennyNeural' }
$cloudinaryUrl = if ($current['CLOUDINARY_URL']) { $current['CLOUDINARY_URL'] } else { '' }
$publicBaseUrl = if ($current['PUBLIC_BASE_URL']) { $current['PUBLIC_BASE_URL'] } else { '' }

$content = @"
PORT=$port
DB_NAME=$dbName
MONGO_URI=$mongoUri
AUTH_SECRET=$authSecret
PAYMENT_MODE=$paymentMode
CLOUDINARY_URL=$cloudinaryUrl
PUBLIC_BASE_URL=$publicBaseUrl

# Free online neural voice (no Azure API key/subscription required)
EDGE_TTS_BN_VOICE=$bnVoice
EDGE_TTS_EN_VOICE=$enVoice
"@

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($envPath, $content.TrimStart(), $utf8NoBom)
Write-Host ''
Write-Host '[OK] .env was updated safely.' -ForegroundColor Green
Write-Host 'The MongoDB password was URL-encoded automatically.' -ForegroundColor Green
Write-Host ''
exit 0
