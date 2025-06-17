#!/bin/bash
# See https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

echo "Downloading AWS CLI..."
sudo apt install unzip -y
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip

if [ -d "/usr/local/aws-cli" ]; then
    echo "AWS CLI already installed. Updating..."
    sudo ./aws/install --bin-dir /usr/local/bin --install-dir /usr/local/aws-cli --update
else
    echo "Installing AWS CLI..."
    sudo ./aws/install
fi

rm -rf aws awscliv2.zip
aws --version