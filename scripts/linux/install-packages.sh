#!/bin/bash

run_yarn_command() {
    local directory=$1
    local command=$2

    if [ -d "$directory" ]; then
        yarn --cwd "$directory" "$command" || {
            echo "Failed to run '$command' in $directory. Error: $?" >&2
            exit 1
        }
    else
        echo "Directory '$directory' does not exist." >&2
    fi
}

if ! command -v yarn &> /dev/null
then
    echo "The 'yarn' command is not available. Please install it before running this script." >&2
    exit 1
fi

directories=("../todo-api" "../todo-ui")

for dir in "${directories[@]}"; do
    run_yarn_command "$dir" "install"
done