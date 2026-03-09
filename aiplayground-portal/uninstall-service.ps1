#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Removes the AI Playground Portal Windows Service.
.DESCRIPTION
    Stops and unregisters the service installed by install-service.ps1.
    WinSW and log files are left intact.
.NOTES
    Run as Administrator.
#>

$ErrorActionPreference = "Stop"

$ServiceName = "aiplayground-portal"
$ScriptDir   = $PSScriptRoot
$ServiceExe  = Join-Path $ScriptDir "scripts\aiplayground-portal.exe"
$XmlConfig   = Join-Path $ScriptDir "scripts\aiplayground-portal.xml"

# Check if service is even registered
$svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if (-not $svc) {
    Write-Host "Service '$ServiceName' is not installed. Nothing to do." -ForegroundColor Yellow
    exit 0
}

# Use WinSW if XML config exists, else fall back to sc.exe
if ((Test-Path $ServiceExe) -and (Test-Path $XmlConfig)) {
    Write-Host "Stopping service '$ServiceName'..." -ForegroundColor Cyan
    & $ServiceExe stop 2>&1 | Out-Null
    Write-Host "Service stopped." -ForegroundColor Green

    Write-Host "Removing service '$ServiceName'..." -ForegroundColor Cyan
    & $ServiceExe uninstall
    if ($LASTEXITCODE -ne 0) { throw "WinSW uninstall failed (exit code $LASTEXITCODE)" }
} else {
    Write-Host "WinSW or XML config not found — falling back to sc.exe..." -ForegroundColor Yellow
    if ($svc.Status -eq "Running") {
        Stop-Service -Name $ServiceName -Force
        Write-Host "Service stopped." -ForegroundColor Green
    }
    & sc.exe delete $ServiceName
    if ($LASTEXITCODE -ne 0) { throw "sc.exe delete failed (exit code $LASTEXITCODE)" }
}

Write-Host "`nService '$ServiceName' has been removed." -ForegroundColor Green
Write-Host "Log files are kept in: $(Join-Path $ScriptDir 'logs\')" -ForegroundColor DarkGray
