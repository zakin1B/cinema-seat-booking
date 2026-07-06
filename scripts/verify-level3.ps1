$ErrorActionPreference = "Stop"

Write-Host "== Level 3 local verification =="

rustup target add wasm32v1-none

cargo fmt --all -- --check
cargo test --workspace
cargo build --workspace --target wasm32v1-none --release

Push-Location frontend

if (!(Test-Path ".\package-lock.json")) {
    npm install --package-lock-only
}

npm ci
npm run type-check
npm run build
npm test

Pop-Location

Write-Host "Level 3 local verification passed."