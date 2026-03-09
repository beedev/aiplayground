#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Installs the AI Playground Portal as a Windows Service using WinSW.
.DESCRIPTION
    - Downloads WinSW v2.12.0 from GitHub Releases if not present
    - Builds the Next.js app for production
    - Generates scripts/aiplayground-portal.xml with all service settings
    - Registers `next start -p 5013 -H 0.0.0.0` as a Windows Service
    - Injects environment variables from .env
    - Starts the service immediately
.NOTES
    Run as Administrator. Re-running is safe -- removes existing service first.
#>

$ErrorActionPreference = "Stop"

$ServiceName  = "aiplayground-portal"
$DisplayName  = "AI Playground Portal"
$Description  = "Next.js AI Playground on port 5013"
$Port         = 5013
$Host_        = "0.0.0.0"

# Resolve paths relative to this script's directory
$ScriptDir    = $PSScriptRoot
$ScriptsDir   = Join-Path $ScriptDir "scripts"
$WinswExe     = Join-Path $ScriptsDir "winsw.exe"
$ServiceExe   = Join-Path $ScriptsDir "aiplayground-portal.exe"
$XmlConfig    = Join-Path $ScriptsDir "aiplayground-portal.xml"
$LogDir       = Join-Path $ScriptDir "logs"
$EnvFile      = Join-Path $ScriptDir ".env"

# ---------------------------------------------------------------------------
# 0. Pin Node.js version
# ---------------------------------------------------------------------------
$env:NODE_HOME = "D:\soft\node-v24.14.0-win-x64"
$env:PATH      = "$env:NODE_HOME;$env:PATH"
Write-Host "Using Node: $((Get-Command node -ErrorAction Stop).Source)" -ForegroundColor Cyan
Write-Host "Node version: $(node -v)" -ForegroundColor Cyan

# ---------------------------------------------------------------------------
# 1. Ensure WinSW is available
# ---------------------------------------------------------------------------
if (-not (Test-Path $WinswExe)) {
    Write-Host "Downloading WinSW v2.12.0..." -ForegroundColor Cyan
    $null = New-Item -ItemType Directory -Force -Path $ScriptsDir

    $WinswUrl = "https://github.com/winsw/winsw/releases/download/v2.12.0/WinSW-x64.exe"
    Invoke-WebRequest -Uri $WinswUrl -OutFile $WinswExe -UseBasicParsing
    Write-Host "WinSW saved to: $WinswExe" -ForegroundColor Green
} else {
    Write-Host "WinSW already present at: $WinswExe" -ForegroundColor Green
}

# Ensure the service-named exe exists (WinSW v2 discovers config by exe name)
if (-not (Test-Path $ServiceExe)) {
    Copy-Item $WinswExe $ServiceExe
}

# ---------------------------------------------------------------------------
# 2. Build the Next.js app
# ---------------------------------------------------------------------------
Write-Host "`nBuilding Next.js app for production..." -ForegroundColor Cyan
Push-Location $ScriptDir
try {
    & npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build failed (exit code $LASTEXITCODE)" }
} finally {
    Pop-Location
}
Write-Host "Build complete." -ForegroundColor Green

# ---------------------------------------------------------------------------
# 3. Resolve node.exe and Next.js binary paths
# ---------------------------------------------------------------------------
$NodeExe = (Get-Command node -ErrorAction Stop).Source
Write-Host "`nUsing node: $NodeExe" -ForegroundColor Cyan
Write-Host "Node version: $(& $NodeExe -v)" -ForegroundColor Cyan

$NextJs = Join-Path $ScriptDir "node_modules\next\dist\bin\next"
if (-not (Test-Path $NextJs)) {
    throw "Could not find Next.js binary at: $NextJs"
}
$AppArgs = "`"$NextJs`" start -p $Port -H $Host_"

# ---------------------------------------------------------------------------
# 4. Ensure logs directory exists
# ---------------------------------------------------------------------------
$null = New-Item -ItemType Directory -Force -Path $LogDir

# ---------------------------------------------------------------------------
# 5. Read .env and build XML env elements
# ---------------------------------------------------------------------------
$envXmlLines = @()
if (Test-Path $EnvFile) {
    Write-Host "Reading environment variables from .env..." -ForegroundColor Cyan
    $envLines = Get-Content $EnvFile | Where-Object {
        $_ -match '^\s*[^#\s]' -and $_ -match '='
    }
    foreach ($line in $envLines) {
        # Strip inline comments and trim whitespace
        $line = ($line -split '#')[0].Trim()
        if ($line -match '^([^=]+)=(.*)$') {
            $key   = $Matches[1].Trim()
            $value = $Matches[2].Trim().Trim('"').Trim("'")
            # Escape XML special characters in value
            $value = $value -replace '&', '&amp;'
            $value = $value -replace '<', '&lt;'
            $value = $value -replace '>', '&gt;'
            $value = $value -replace '"', '&quot;'
            $envXmlLines += "  <env name=`"$key`" value=`"$value`"/>"
            Write-Host "  Injecting env: $key" -ForegroundColor DarkGray
        }
    }
    Write-Host "Environment variables prepared." -ForegroundColor Green
} else {
    Write-Host "No .env file found -- skipping environment injection." -ForegroundColor Yellow
}

$envXmlBlock = $envXmlLines -join "`n"

# ---------------------------------------------------------------------------
# 6. Generate WinSW XML config
# ---------------------------------------------------------------------------
Write-Host "`nGenerating WinSW XML config..." -ForegroundColor Cyan

$xmlContent = @"
<service>
  <id>$ServiceName</id>
  <name>$DisplayName</name>
  <description>$Description</description>
  <executable>$NodeExe</executable>
  <arguments>$AppArgs</arguments>
  <workingdirectory>$ScriptDir</workingdirectory>
  <logpath>$LogDir</logpath>
  <log mode="roll-by-size">
    <sizeThreshold>10240</sizeThreshold>
    <keepFiles>8</keepFiles>
  </log>
  <onfailure action="restart" delay="5 sec"/>
  <onfailure action="restart" delay="5 sec"/>
  <onfailure action="restart" delay="5 sec"/>
  <startmode>Automatic</startmode>
$envXmlBlock
</service>
"@

[System.IO.File]::WriteAllText($XmlConfig, $xmlContent, [System.Text.Encoding]::UTF8)
Write-Host "XML config written to: $XmlConfig" -ForegroundColor Green

# ---------------------------------------------------------------------------
# 7. Remove existing service (if any)
# ---------------------------------------------------------------------------
$existing = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "`nRemoving existing service '$ServiceName'..." -ForegroundColor Yellow
    & $ServiceExe stop 2>&1 | Out-Null
    & $ServiceExe uninstall 2>&1 | Out-Null
    Write-Host "Existing service removed." -ForegroundColor Yellow
}

# ---------------------------------------------------------------------------
# 8. Install the service
# ---------------------------------------------------------------------------
Write-Host "`nInstalling service '$ServiceName'..." -ForegroundColor Cyan
& $ServiceExe install
if ($LASTEXITCODE -ne 0) { throw "WinSW install failed (exit code $LASTEXITCODE)" }
Write-Host "Service installed." -ForegroundColor Green

# ---------------------------------------------------------------------------
# 9. Start the service
# ---------------------------------------------------------------------------
Write-Host "`nStarting service..." -ForegroundColor Cyan
& $ServiceExe start
Start-Sleep -Seconds 3

$svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($svc -and $svc.Status -eq "Running") {
    Write-Host "`nService '$ServiceName' is RUNNING." -ForegroundColor Green
    Write-Host "Access the app at: http://localhost:$Port/aiplayground" -ForegroundColor Cyan
} else {
    Write-Warning "Service may not have started. Check logs in: $LogDir"
}

Write-Host "`nDone. To manage the service:" -ForegroundColor White
Write-Host "  Start:   Start-Service $ServiceName" -ForegroundColor DarkGray
Write-Host "  Stop:    Stop-Service $ServiceName"  -ForegroundColor DarkGray
Write-Host "  Remove:  .\uninstall-service.ps1"    -ForegroundColor DarkGray
