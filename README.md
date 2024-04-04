<div align="center">
  <h1>OpenMCPanel</h1>
</div>

<div align="center">
 <img src="https://img.shields.io/github/actions/workflow/status/SpikeHD/OpenMCPanel/build.yml" />
 <img src="https://img.shields.io/github/package-json/v/SpikeHD/OpenMCPanel" />
 <img src="https://img.shields.io/github/repo-size/SpikeHD/OpenMCPanel" />
</div>
<div align="center">
 <img src="https://img.shields.io/github/commit-activity/m/SpikeHD/OpenMCPanel" />
 <img src="https://img.shields.io/github/release-date/SpikeHD/OpenMCPanel" />
 <img src="https://img.shields.io/github/stars/SpikeHD/OpenMCPanel" />
 <img src="https://img.shields.io/github/downloads/SpikeHD/OpenMCPanel/total" />
</div>

<div align="center">
  Create, manage, and monitor one, few, or many Minecraft servers using a web-based UI. Powered by [itzg/docker-minecraft-server](https://github.com/itzg/docker-minecraft-server).
  <br />
  https://discord.gg/agQ9mRdHMZ
</div>

# Table of Contents

- [Features](#features)
- [Get Started](#get-started)
  - [Prerequisites](#prerequisites)
  - [Steps](#steps)
- [Building](#building)
  - [Prerequisites](#prerequisites-1)
  - [Steps](#steps-1)
- [Recommendations](#recommendations)

# Features

* **One-Click Server Deployment** - Deploy a Minecraft server with a single click.
* **Multiple Server Type Support** - Vanilla, Spigot, Paper, Fabric, etc. are all supported. Modpacks and mod lists are also supported!
* **Simple Server Management** - Start and stop, manual and scheduled backups, on-the-fly command running, and more.
* **Realtime Monitoring** - Keep track of player count, memory usage, and more.

# Get Started

## Prerequisites

* [Docker](https://docs.docker.com/get-docker/) (or an equivalent, such as [Podman](https://podman.io/))
* Webserver (such as [NGINX](https://www.nginx.com/))

## Steps

1. Download the latest release and extract it (you can also download [an Actions build](https://www.github.com/SpikeHD/OpenMCPanel/actions/workflows/build.yml)):
```bash
# Windows
curl -L "https://www.github.com/SpikeHD/OpenMCPanel/releases/latest/download/omcp_win64.zip" -o omcp.zip
unzip omcp.zip

# Linux/MacOS
curl -L "https://www.github.com/SpikeHD/OpenMCPanel/releases/latest/download/omcp_linux64.tar.gz" -o omcp.tar.gz
tar -xzf omcp.tar.gz
```

2. Run the binary:
```bash
# Windows
./omcp.exe --help

# Linux/MacOS
./omcp --help
```

> [!NOTE]
> If you'd just like to play around with OpenMCPanel, you can specfiy `--address <your_external_ip>` which will expose the server
> **(INSECURELY, no HTTPS!)** to the web without the need for a reverse proxy. This is NOT recommended for anything more than brief testing.
>
> You can also (again, **SUPER INSECURE**, only use this for testing/evalutation) specify `--no-auth` to disable the username/password requirement.
> Again, this is NOT recommended for anything more than brief testing.

3. After reviewing the options, start the server with a configuration of your liking:
```bash
# Windows
./omcp.exe --log omcp.log --port 8080 --username Tester

# Linux/MacOS
./omcp --log omcp.log --port 8080 --username Tester
```

4. Open your web browser and navigate to `http://localhost:[PORT]` to access the panel! You are ready to deploy!

If you need to access the web interface remotely, make sure to configure your webserver to reverse-proxy to the port you specified

# Building

## Prerequisites

* [Node.js](https://nodejs.org/en/download/) (or your favorite runtime)
* [Rust and Cargo](https://www.rust-lang.org/tools/install)

## Steps

1. Clone the repository:
```bash
git clone https://github.com/SpikeHD/OpenMCPanel.git
cd OpenMCPanel
```

2. Install the dependencies:
```bash
cd web
npm install
```

3. Build the project:
```bash
# Build the frontend
npm run build

# Build the backend
cd ..
cargo build --release
```

Your binary will be located at `target/release/omcp`.

# Recommendations

* [fail2ban](https://github.com/fail2ban/fail2ban) - Protect from brute force attacks

# TODO

* [ ] Multilingual support
* [ ] Remote Docker host support
* [ ] Custom .jar support
