function Run-YarnCommand {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Directory,
        [Parameter(Mandatory=$true)]
        [string]$Command
    )

    if (Test-Path $Directory) {
        try {
            yarn --cwd $Directory $Command
        } catch {
            Write-Error "Failed to run '$Command' in $Directory. Error: $_"
            exit 1
        }
    } else {
        Write-Warning "Directory '$Directory' does not exist."
    }
}

if (-not (Get-Command yarn -ErrorAction SilentlyContinue)) {
    Write-Error "The 'yarn' command is not available. Please install it before running this script."
    exit 1
}

$directories = @("../todo-api", "../todo-ui")

foreach ($dir in $directories) {
    Run-YarnCommand -Directory $dir -Command "install"
}