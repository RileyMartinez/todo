#!/bin/bash
# See https://docs.docker.com/engine/install/linux-postinstall/

# Create docker group
sudo groupadd docker

# Add user to docker group
sudo usermod -aG docker $USER

# Activate group changes
newgrp docker

# Verify can run docker commands without sudo
docker run hello-world
