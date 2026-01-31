+++
title = "HomeLab Guides"
slug = "homelab"
date = "2025-12-06"
draft = false
description = "Guides on how to build a home lab"
+++

<img src="https://cdn.chris-smith.net/homelab/guidesImage.png" alt="HomeLab diagram" style="float:right; margin:0 0 1rem 1rem; width:260px;">

## Description

Most of my guides are based around Unraid using templates provided by the community.  If you're not using Unraid they'll still work for you but you'll need to figure out your initial docker setup command.

A lot of these guides are still in progress.

## Topics

### Website

- Hosting a website using Hugo & Cloudflare
- Free website image hosting with Cloudflare

### Networking

- [Custom docker network](https://chris-smith.net/posts/homelab-customnetwork/)
Create a VLAN that can be used for your docker containers.
- NGINX

### Tunneling

Forget port forwarding, these guides will help you access your services remotely.

- Cloudflare
    - Cloudflare Tunnel Setup
    - Firewall rules
- [Tailscale](https://chris-smith.net/posts/tailscale/)
Create a private virtual network between your devices and friends devices.
- [PlayIt.GG](https://chris-smith.net/posts/playitgg/)
share game servers with friends

### Security

- [PocketID](https://chris-smith.net/posts/pocketid/) OIDC - One login for all of your services using passkeys
- CrowdSec (Crowdsourced IP blacklists - securing your tunnels)

## Cool apps to checkout

- Nextcloud: host your own Google cloud
- Plex: Stream your own movies anywhere
- Booklore: Your own ebook server.  I tend to get a lot of DRM free books from HumbleBundle
- Romm: Play your romms anywhere in your browser.
