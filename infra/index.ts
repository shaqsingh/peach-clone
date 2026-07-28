import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";

// Retrieve the SSH key name from Pulumi config
const config = new pulumi.Config();
const sshKeyName = config.require("sshKeyName");

// Look up the existing SSH key by name in your DigitalOcean account
const sshKey = digitalocean.getSshKeyOutput({
    name: sshKeyName,
});

const droplet = new digitalocean.Droplet("peach-clone-vm", {
    image: "ubuntu-24-04-x64",
    region: "sfo3",
    size: "s-1vcpu-1gb", // Minimum recommended size for Next.js builds ($6/mo)
    sshKeys: [sshKey.id.apply(id => id.toString())],
    // Startup script to install Docker and start the service
    userData: `#!/bin/bash
export DEBIAN_FRONTEND=noninteractive

# Setup 2GB swap file to prevent Next.js build from running out of memory (OOM) on a 1GB Droplet
echo "🔧 Configuring 2GB Swap Space..."
fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Update system
apt-get update && apt-get upgrade -y
apt-get install -y apt-transport-https ca-certificates curl software-properties-common git

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Ensure docker-compose-plugin is installed (included in get.docker.com, but added for safety)
apt-get install -y docker-compose-v2

# Create app directory
mkdir -p /app
chmod 755 /app

echo "Setup Complete. Instance is ready for Peach Clone."
`,
});

export const instanceIp = droplet.ipv4Address;
