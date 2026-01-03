+++
title = "PlayIt.GG" 
description = "Share your game servers with friends for free" 
tags = [ "tunneling","gaming","networking",] 
date = "2026-01-02" 
categories = [ "homelab",]
image="https://cdn.chris-smith.net/homelab/playitgg/banner.png"
draft=true
+++

## What it is

Whenever you host servers for games like Minecraft or Palworld, if you want to share those servers with your friends you'll need to setup port forwarding on your router.  You're affectively poking holes into the wall that seperates your home from the outside world.

You could use Tailscale to share your servers with friends securely, but this requires everyone using your server to download new software onto their computers. I find that most people don't like to do that and don't understand why they can't just connect to the server like they would with official servers.

This is where PlayIt.gg comes in.  It's a tunneling service that exposes your servers on a playit.gg address.  It's similar to Cloudflare and Tailscale tunnels, but unlike Tailscale your friends don't have to download software.

## Alert! Recent changes to the free plan

