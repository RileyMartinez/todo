function Import-EnvVariables {
    param (
        [Parameter(Mandatory=$true)]
        [string]$EnvFilePath
    )

    if (Test-Path $EnvFilePath) {
        Get-Content $EnvFilePath | ForEach-Object {
            $line = $_.Trim()
            if (-not [string]::IsNullOrWhiteSpace($line) -and -not $line.StartsWith("#")) {
                $parts = $line -split '=', 2
                if ($parts.Count -eq 2) {
                    $name = $parts[0].Trim()
                    $value = $parts[1].Trim()
                    Set-Item "env:$name" $value
                }
            }
        }
    } else {
        Write-Warning "Env file '$EnvFilePath' does not exist."
    }
}
