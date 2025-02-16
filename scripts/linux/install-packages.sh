#!/bin/bash

run_pnpm_command() {
    local directory=$1
    local command=$2

    if [ -d "$directory" ]; then
        pnpm --cwd "$directory" "$command" || {
            echo "Failed to run '$command' in $directory. Error: $?" >&2
            exit 1
        }
    else
        echo "Directory '$directory' does not exist." >&2
    fi
}

if ! command -v pnpm &> /dev/null
then
    echo "The 'pnpm' command is not available. Please install it before running this script." >&2
    exit 1
fi

directories=("../../api" "../../ui")

for dir in "${directories[@]}"; do
    run_pnpm_command "$dir" "install"
done