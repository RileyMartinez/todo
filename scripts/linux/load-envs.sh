#!/bin/bash

load_environment_variables() {
    local input_file=$1
    local output_file=$2

    if [ -f "$input_file" ]; then
        echo "Loading environment variables from $input_file to $output_file"
        op inject -f -i "$input_file" -o "$output_file"
    else
        echo "File not found: $input_file"
    fi
}

if ! command -v op &> /dev/null
then
    echo "1Password CLI is not installed. Please install it from https://1password.com/downloads/command-line/."
    exit 1
fi

if [ -z "$APP_ENV" ]; then
    APP_ENV="dev"
fi

declare -A paths=(
    ["../.env.op"]="../.env"
    ["../todo-api/.env.op"]="../todo-api/.env"
    ["../todo-ui/.env.op"]="../todo-ui/.env"
)

for input_file in "${!paths[@]}"; do
    load_environment_variables "$input_file" "${paths[$input_file]}"
done