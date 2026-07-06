$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$FrontendDir = Join-Path $ProjectRoot "frontend"

function Write-Step {
    param([string]$Message)

    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Assert-File {
    param(
        [string]$Path,
        [string]$Label
    )

    if (-not (Test-Path $Path)) {
        throw "Missing required file: $Path"
    }

    Write-Host ("OK: " + $Label) -ForegroundColor Green
}

function Assert-Text {
    param(
        [string]$Path,
        [string]$Pattern,
        [string]$Label
    )

    $Content = Get-Content $Path -Raw

    if ($Content -notmatch [Regex]::Escape($Pattern)) {
        throw "Missing expected text in $Path : $Pattern"
    }

    Write-Host ("OK: " + $Label) -ForegroundColor Green
}

Set-Location $ProjectRoot

Write-Step "Check required Level 3 files"

Assert-File -Path ".\Cargo.toml" -Label "Rust workspace"
Assert-File -Path ".\contracts\cinema_booking\Cargo.toml" -Label "Cinema contract Cargo.toml"
Assert-File -Path ".\contracts\cinema_booking\src\lib.rs" -Label "Cinema contract"
Assert-File -Path ".\contracts\cinema_booking\src\test.rs" -Label "Contract tests"
Assert-File -Path ".\scripts\deploy-and-save.ps1" -Label "Deployment script"
Assert-File -Path ".\CONTRACT_ID.txt" -Label "Deployed contract ID"
Assert-File -Path ".\DEPLOYMENT.md" -Label "Deployment summary"
Assert-File -Path ".\frontend\src\contractConfig.ts" -Label "Frontend contract config"
Assert-File -Path ".\frontend\src\services\wallet.ts" -Label "Freighter wallet service"
Assert-File -Path ".\frontend\src\services\contract.ts" -Label "Soroban contract service"
Assert-File -Path ".\frontend\src\services\contract.test.ts" -Label "Frontend integration tests"
Assert-File -Path ".\frontend\src\App.tsx" -Label "Dashboard UI"

Write-Step "Check deployed contract ID"

$ContractId = (Get-Content ".\CONTRACT_ID.txt" -Raw).Trim()

if ($ContractId -notmatch "^C[A-Z2-7]{55}$") {
    throw "Invalid contract ID: $ContractId"
}

Write-Host ("Contract ID: " + $ContractId) -ForegroundColor Green

Write-Step "Check wallet integration requirements"

Assert-Text -Path ".\frontend\src\services\wallet.ts" -Pattern "requestAccess" -Label "Freighter requestAccess is implemented"
Assert-Text -Path ".\frontend\src\services\wallet.ts" -Pattern "getAddress" -Label "Freighter getAddress is implemented"
Assert-Text -Path ".\frontend\src\services\wallet.ts" -Pattern "signTransaction" -Label "Freighter signTransaction is implemented"

Write-Step "Check Soroban integration requirements"

Assert-Text -Path ".\frontend\src\services\contract.ts" -Pattern "TransactionBuilder" -Label "TransactionBuilder is used"
Assert-Text -Path ".\frontend\src\services\contract.ts" -Pattern "prepareTransaction" -Label "prepareTransaction is used"
Assert-Text -Path ".\frontend\src\services\contract.ts" -Pattern "sendTransaction" -Label "sendTransaction is used"
Assert-Text -Path ".\frontend\src\services\contract.ts" -Pattern "nativeToScVal" -Label "nativeToScVal is used"
Assert-Text -Path ".\frontend\src\services\contract.ts" -Pattern "scValToNative" -Label "scValToNative is used"

Write-Step "Check frontend and contract function matching"

Assert-Text -Path ".\contracts\cinema_booking\src\lib.rs" -Pattern "pub fn book_seat" -Label "Contract defines book_seat"
Assert-Text -Path ".\contracts\cinema_booking\src\lib.rs" -Pattern "pub fn cancel_booking" -Label "Contract defines cancel_booking"
Assert-Text -Path ".\contracts\cinema_booking\src\lib.rs" -Pattern "pub fn check_in" -Label "Contract defines check_in"
Assert-Text -Path ".\contracts\cinema_booking\src\lib.rs" -Pattern "pub fn is_booked" -Label "Contract defines is_booked"
Assert-Text -Path ".\contracts\cinema_booking\src\lib.rs" -Pattern "pub fn get_seat_owner" -Label "Contract defines get_seat_owner"
Assert-Text -Path ".\contracts\cinema_booking\src\lib.rs" -Pattern "pub fn stats" -Label "Contract defines stats"

Assert-Text -Path ".\frontend\src\services\contract.ts" -Pattern "book_seat" -Label "Frontend calls book_seat"
Assert-Text -Path ".\frontend\src\services\contract.ts" -Pattern "cancel_booking" -Label "Frontend calls cancel_booking"
Assert-Text -Path ".\frontend\src\services\contract.ts" -Pattern "check_in" -Label "Frontend calls check_in"
Assert-Text -Path ".\frontend\src\services\contract.ts" -Pattern "is_booked" -Label "Frontend reads is_booked"
Assert-Text -Path ".\frontend\src\services\contract.ts" -Pattern "get_seat_owner" -Label "Frontend reads get_seat_owner"
Assert-Text -Path ".\frontend\src\services\contract.ts" -Pattern "stats" -Label "Frontend reads stats"

Write-Step "Run contract format check"
cargo fmt --all -- --check

Write-Step "Run contract tests"
cargo test --workspace

Write-Step "Build Soroban WASM"
cargo build --workspace --target wasm32v1-none --release

Write-Step "Run frontend tests"
Set-Location $FrontendDir
npm test

Write-Step "Build frontend"
npm run build

Set-Location $ProjectRoot

Write-Host ""
Write-Host "Cinema Seat Booking Level 3 verification completed successfully." -ForegroundColor Green