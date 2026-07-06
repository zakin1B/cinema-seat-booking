param(
    [string]$SourceAccount = "deployer"
)

$ErrorActionPreference = "Stop"

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

Write-Host "== Build and deploy Cinema Seat Booking =="

cargo fmt --all
cargo test --workspace

stellar contract build

$Wasm = Get-ChildItem -Path ".\target" -Recurse -Filter "cinema_seat_booking*.wasm" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if ($null -eq $Wasm) {
    throw "Cannot find built cinema_seat_booking wasm file."
}

Write-Host "Deploying wasm: $($Wasm.FullName)"

$ContractId = stellar contract deploy `
    --wasm $Wasm.FullName `
    --source-account $SourceAccount `
    --network testnet

$ContractId = $ContractId.Trim()

[System.IO.File]::WriteAllText((Resolve-Path ".\CONTRACT_ID.txt"), $ContractId, $Utf8NoBom)

$ConfigPath = ".\frontend\src\contractConfig.ts"
$Config = Get-Content $ConfigPath -Raw

$Config = $Config -replace 'export const CONTRACT_ID =\s*"[^"]+";', "export const CONTRACT_ID =`n  `"$ContractId`";"

[System.IO.File]::WriteAllText((Resolve-Path $ConfigPath), $Config, $Utf8NoBom)

Write-Host "Contract deployed:"
Write-Host $ContractId
Write-Host "Updated CONTRACT_ID.txt and frontend/src/contractConfig.ts"