import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";

const droplet = new digitalocean.Droplet("peach-clone-vm", {
    image: "ubuntu-24-04-x64",
    region: "sfo3",
    size: "s-1vcpu-1gb",
    // Startup script to install Docker and start the service
    userData: `#!/bin/bash
export DEBIAN_FRONTEND=noninteractive

# Update system
apt-get update && apt-get upgrade -y
apt-get install -y apt-transport-https ca-certificates curl software-properties-common git

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
mkdir -p /usr/local/bin
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create app structure
mkdir -p /app/data
mkdir -p /app/public/uploads
cd /app

# At this point, the user would clone their repo:
# git clone <YOUR_REPO_URL> .
# cp .env.example .env
# # Edit .env with your domain/secrets
# docker-compose up -d --build

echo "Setup Complete. Instance is ready for Peach Clone."
`,
});

export const instanceIp = droplet.ipv4Address;
