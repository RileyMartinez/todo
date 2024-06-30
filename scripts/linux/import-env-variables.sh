#!/bin/bash

import_env_variables() {
    env_file_path="$1"

    if [[ -f "$env_file_path" ]]; then
        while IFS= read -r line || [[ -n "$line" ]]; do
            # Trim leading and trailing whitespace
            line=$(echo "$line" | xargs)
            
            # Skip empty lines and lines starting with '#'
            if [[ -z "$line" || "$line" =~ ^# ]]; then
                continue
            fi

            # Export the variable
            # Using eval to handle values with spaces correctly
            eval export "$line"
        done < "$env_file_path"
    else
        echo "Env file '$env_file_path' does not exist."
    fi
}
