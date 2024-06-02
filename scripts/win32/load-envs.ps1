function Load-EnvironmentVariables {
    param (
        [Parameter(Mandatory=$true)]
        [string]$InputFile,
        [Parameter(Mandatory=$true)]
        [string]$OutputFile
    )

    if (Test-Path $InputFile) {
        Write-Host "Loading environment variables from $InputFile to $OutputFile"
        op.exe inject -f -i $InputFile -o $OutputFile
    } else {
        Write-Host "File not found: $InputFile"
    }
}

param (
    [string]$env = "dev"
)

if (-not (Get-Command op.exe -ErrorAction SilentlyContinue)) {
    Write-Host "1Password CLI is not installed. Please install it from https://1password.com/downloads/command-line/."
    exit 1
}

if (-not $env:APP_ENV) {
    $env:APP_ENV = $env
}

$paths = @(
    @{
        input = "../.env.op"
        output = "../.env"
    },
    @{
        input = "../todo-api/.env.op"
        output = "../todo-api/.env"
    },
    @{
        input = "../todo-ui/.env.op"
        output = "../todo-ui/.env"
    }
)

foreach ($path in $paths) {
    Load-EnvironmentVariables -InputFile $path.input -OutputFile $path.output
}