#!/bin/bash
# See https://docs.docker.com/desktop/wsl/

# Check WSL mode
wsl.exe -l -v

# Upgrade distro to v2
wsl.exe --set-version Ubuntu 2

# Set WSL 2 as default
wsl.exe --set-default-version 2

# Set default distro
wsl.exe --set-default Ubuntu