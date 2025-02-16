function Start-PnpmCommand {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Directory,
        [Parameter(Mandatory=$true)]
        [string]$Command
    )

    if (Test-Path $Directory) {
        try {
            pnpm --cwd $Directory $Command
        } catch {
            Write-Error "Failed to run '$Command' in $Directory. Error: $_"
            exit 1
        }
    } else {
        Write-Warning "Directory '$Directory' does not exist."
    }
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Error "The 'pnpm' command is not available. Please install it before running this script."
    exit 1
}

$directories = @("../../api", "../../ui")

foreach ($dir in $directories) {
    Start-PnpmCommand -Directory $dir -Command "install"
}