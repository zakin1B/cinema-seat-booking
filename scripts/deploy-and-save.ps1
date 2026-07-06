$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

Set-Location $ProjectRoot

function Write-Utf8NoBom {
    param(
        [string]$Path,
        [string]$Content
    )

    $FullPath = Join-Path (Get-Location) $Path
    [System.IO.File]::WriteAllText($FullPath, $Content, $Utf8NoBom)
}

function Invoke-StellarQuiet {
    param(
        [string]$Name,
        [string[]]$CommandArgs
    )

    $OutFile = Join-Path (Get-Location) "$Name-stdout.txt"
    $ErrFile = Join-Path (Get-Location) "$Name-stderr.txt"

    Remove-Item $OutFile -Force -ErrorAction SilentlyContinue
    Remove-Item $ErrFile -Force -ErrorAction SilentlyContinue

    $CleanArgs = @()

    foreach ($Item in $CommandArgs) {
        if ($null -ne $Item -and "$Item".Trim().Length -gt 0) {
            $CleanArgs += "$Item"
        }
    }

    $Process = Start-Process `
        -FilePath "stellar" `
        -ArgumentList $CleanArgs `
        -Wait `
        -NoNewWindow `
        -PassThru `
        -RedirectStandardOutput $OutFile `
        -RedirectStandardError $ErrFile

    $OutText = ""
    $ErrText = ""

    if (Test-Path $OutFile) {
        $OutText = Get-Content $OutFile -Raw
    }

    if (Test-Path $ErrFile) {
        $ErrText = Get-Content $ErrFile -Raw
    }

    $Combined = ($OutText + "`n" + $ErrText).Trim()

    if ($Process.ExitCode -ne 0) {
        throw "Stellar command failed: $Name"
    }

    return $Combined
}

Write-Host "RUNNING: deploy cinema booking contract"

cargo test --workspace | Out-Null
stellar contract build | Out-Null

$Wasm = Get-ChildItem -Path ".\target" -Recurse -Filter "cinema_booking.wasm" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if ($null -eq $Wasm) {
    throw "Cannot find cinema_booking.wasm"
}

$UploadText = Invoke-StellarQuiet -Name "upload-wasm" -CommandArgs @(
    "contract",
    "upload",
    "--wasm",
    $Wasm.FullName,
    "--source-account",
    "deployer",
    "--network",
    "testnet"
)

$WasmHashMatches = [regex]::Matches($UploadText, "(?i)\b[0-9a-f]{64}\b")

if ($WasmHashMatches.Count -eq 0) {
    throw "Cannot find WASM hash after upload."
}

$WasmHash = $WasmHashMatches[$WasmHashMatches.Count - 1].Value

$DeployText = Invoke-StellarQuiet -Name "deploy-contract" -CommandArgs @(
    "contract",
    "deploy",
    "--source-account",
    "deployer",
    "--network",
    "testnet",
    "--wasm-hash",
    $WasmHash
)

$ContractMatches = [regex]::Matches($DeployText, "C[A-Z2-7]{55}")

if ($ContractMatches.Count -eq 0) {
    throw "Cannot find Contract ID after deploy."
}

$ContractId = $ContractMatches[$ContractMatches.Count - 1].Value

$Admin = (stellar keys address deployer 2>$null | Select-Object -First 1).Trim()

if (-not $Admin -or -not $Admin.StartsWith("G")) {
    throw "Cannot read deployer public key."
}

Start-Sleep -Seconds 45

Invoke-StellarQuiet -Name "initialize-contract" -CommandArgs @(
    "contract",
    "invoke",
    "--id",
    $ContractId,
    "--source-account",
    "deployer",
    "--network",
    "testnet",
    "--",
    "initialize",
    "--admin",
    $Admin
) | Out-Null

$SeatId = Get-Random -Minimum 10000 -Maximum 999999

$InvokeText = Invoke-StellarQuiet -Name "invoke-book-seat" -CommandArgs @(
    "contract",
    "invoke",
    "--id",
    $ContractId,
    "--source-account",
    "deployer",
    "--network",
    "testnet",
    "--",
    "book_seat",
    "--user",
    $Admin,
    "--seat_id",
    "$SeatId"
)

$HashMatches = [regex]::Matches($InvokeText, "(?i)\b[0-9a-f]{64}\b")

if ($HashMatches.Count -eq 0) {
    throw "Cannot find transaction hash after book_seat."
}

$TxHash = $HashMatches[$HashMatches.Count - 1].Value.ToLower()

Write-Utf8NoBom ".\CONTRACT_ID.txt" $ContractId
Write-Utf8NoBom ".\SUCCESSFUL_TX.txt" $TxHash

$Config = @"
export const CONTRACT_CONFIG = {
  network: "testnet",
  networkPassphrase: "Test SDF Network ; September 2015",
  rpcUrl: "https://soroban-testnet.stellar.org",
  explorerBaseUrl: "https://stellar.expert/explorer/testnet",
  contractId: "$ContractId",
  deployedAt: "Stellar Testnet",
};

export const hasDeployedContract =
  CONTRACT_CONFIG.contractId.startsWith("C") &&
  CONTRACT_CONFIG.contractId.length > 20;

export const getContractExplorerUrl = () =>
  `${CONTRACT_CONFIG.explorerBaseUrl}/contract/${CONTRACT_CONFIG.contractId}`;

export const getTransactionExplorerUrl = (hash: string) =>
  `${CONTRACT_CONFIG.explorerBaseUrl}/tx/${hash}`;
"@

Write-Utf8NoBom ".\frontend\src\contractConfig.ts" $Config

$Deployment = @"
# Cinema Seat Booking Deployment

Network:

````text
Stellar Testnet
````

Contract ID:

````text
$ContractId
````

Contract Explorer:

````text
https://stellar.expert/explorer/testnet/contract/$ContractId
````

Successful Contract Interaction Transaction Hash:

````text
$TxHash
````

Successful Contract Interaction Explorer:

````text
https://stellar.expert/explorer/testnet/tx/$TxHash
````
"@

Write-Utf8NoBom ".\DEPLOYMENT.md" $Deployment

Write-Host ""
Write-Host "DONE"
Write-Host "CONTRACT_ID:"
Write-Host $ContractId
Write-Host "SUCCESSFUL_TX_HASH:"
Write-Host $TxHash
Write-Host "CONTRACT_EXPLORER:"
Write-Host "https://stellar.expert/explorer/testnet/contract/$ContractId"
Write-Host "TX_EXPLORER:"
Write-Host "https://stellar.expert/explorer/testnet/tx/$TxHash"