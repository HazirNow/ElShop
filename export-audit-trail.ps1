# ElShop Pilot Operations: Local Storage Cash Reconciliation Variance Exporter
Param(
    [string]$MockDataPath = "src/mock_device_state.json",
    [string]$OutputPath = "pilot_cash_reconciliation_audit.csv"
)

Write-Host "⚡ Extracting cash drawer override profiles from pilot registries..." -ForegroundColor Cyan

if (-not (Test-Path "src")) { New-Item -ItemType Directory -Path "src" -Force | Out-Null }

if (-not (Test-Path $MockDataPath)) {
    $SampleAuditData = @(
        [PSCustomObject]@{ timestamp = "2026-08-25T10:14:22Z"; expectedFils = 10000; actualFils = 8450;  varianceFils = -1550; reason = "Register missing float cash"; deviceUserAgent = "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X)" },
        [PSCustomObject]@{ timestamp = "2026-08-25T18:45:10Z"; expectedFils = 25000; actualFils = 25000; varianceFils = 0;     reason = "End of shift exact match";    deviceUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        [PSCustomObject]@{ timestamp = "2026-08-26T06:30:05Z"; expectedFils = 15000; actualFils = 14200; varianceFils = -800;  reason = "Customer dispute short change"; deviceUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5)" }
    )
    $SampleAuditData | ConvertTo-Json -Depth 4 | Out-File -FilePath $MockDataPath -Encoding utf8
}

$RawData = Get-Content -Path $MockDataPath -Raw | ConvertFrom-Json
$FormattedRecords = @()
foreach ($Record in $RawData) {
    $FormattedRecords += [PSCustomObject]@{
        "Timestamp (UTC)"   = $Record.timestamp
        "Expected Amt (AED)" = "{0:N2}" -f ($Record.expectedFils / 100)
        "Actual Cash (AED)"  = "{0:N2}" -f ($Record.actualFils / 100)
        "Variance (AED)"     = "{0:N2}" -f ($Record.varianceFils / 100)
        "Audit Status"       = if ($Record.varianceFils -lt 0) { "⚠️ DEFICIT" } elseif ($Record.varianceFils -gt 0) { "📈 SURPLUS" } else { "✅ BALANCED" }
        "Merchant Reason"    = $Record.reason
    }
}

$FormattedRecords | Export-Csv -Path $OutputPath -NoTypeInformation -Encoding utf8
Write-Host "🚀 Success! Exported audit spreadsheet to: $OutputPath" -ForegroundColor Green
$FormattedRecords | Format-Table -AutoSize
