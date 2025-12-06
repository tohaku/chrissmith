+++
title = "TailScale Traffic Routing"
description = "Routing traffic through TailScale using NGINX and DNS"
date = "2025-12-05"
draft = false
tags = ["homelab", "network", "unraid","tailscale","nginx"]
categories = ["HomeLab"]
image="https://cdn.chris-smith.net/homelab/tailscale/routing/banner.png"
+++

                     ┌───────────────────────────┐
                     │     Tailscale Network     │
                     │  (your laptop / phone)    │
                     └──────────────┬────────────┘
                                    │
                           Encrypted Tailscale
                                    │
                         DNS resolves subdomain
                                    │
               fruity.pebbels → 100.x.x.x (NGINX Tailscale IP)
               sonic.pebbels → 100.x.x.x
               nugget.pebbels → 100.x.x.x
                                    │
                                    ▼
                      ┌──────────────────────────┐
                      │     NGINX Reverse Proxy  │
                      │   (Tailscale-enabled)    │
                      │   IP: 100.x.x.x          │
                      └──────────────┬───────────┘
                                     │
        ┌────────────────────────────┼─────────────────────────────┐
        ▼                            ▼                             ▼
        Service 1                  Service 2                  Service 3




## What is Tailscale

Tailscale is a software that basically creates a virtual LAN between devices no matter where they are in the world.  You could use it to have your own Halo LAN party with friends all over the world or use it to share your self hosted services with friends and family without exposing them to the public internet.

## Tailscale setup

This post assumes you've already setup Tailscale on your devices.  If you have a setup similar to mine Unraid has a plugin and guide that makes setup really easy.

Unraid Setup guide: [https://docs.unraid.net/unraid-os/system-administration/secure-your-server/tailscale/?utm_source=google&utm_medium=cpc&utm_campaign=p-max-targeted-us-can&utm_content=&utm_term=&gad_source=1&gad_campaignid=21440886943&gbraid=0AAAAAC26wCIJdzZTNqIwpiXcILb9L2B8F&gclid=Cj0KCQiA_8TJBhDNARIsAPX5qxQ_G4SDhF1F3kffSiwJrQk8zHZJlXqZWEr3oEEzbu7wHXcf6ZAhDw0aAh2MEALw_wcB](link)

## So what is this post about?

There are some services I don't want to expose directly to the internet but I'd like to still be able to access them while travelling.  Unraid makes it possible to expose each of your services directly to Tailscale but that's too insecure.  

My home network is already segmented with multiple VLANs with an NGINX container being the only service permitted on the firewall that I can use to access everything.  I can do the same thing with Tailscale where only NGINX is exposed and will route all of my traffic.

## Setup

### First step - Enable Tailscale on the NGINX container

For my NGINX container I use the one from LinuxServer.io (lscr.io/linuxserver/nginx).  The template contains an option to enable Tailscale. It doesn't need anything special other than specifying the name that'll appear in the Tailscale admin panel.


### Second step - Configure Tailscale
In this portion we're going to modify some settings in the Tailscale admin panel.
1. Enable Magic DNS
    - Go to the DNS tab [https://login.tailscale.com/admin/dns](link)
    - Scroll towards the bottom and click the button to enable Magic DNS
2. Specify your name server
    - On the same DNS page as step 2, specify your DNS server under the Nameservers section.  You can use something like PiHole here, I use my router that supports custom DNS.
    - You'll also need to provide a domain name while specifying the IP. If you're using a URL like fruity.pebbels , pebbels would be the name to specify.  Then all of your URLS will need to end in .pebbels.

### Third step - Configure DNS
For my setup I use my Unifi Dream Machine Pro router as my DNS server and it supports custom DNS. If your router doesn't support custom DNS you can use something like PiHole.

For the Unifi Dream Machine, you can do this by creating new policies and select DNS as the type.  Then create one for each of the services you want to access and specify the IP of your NGINX container that's on Tailscale.   

### Fourth step - Configure NGINX
You'll need to create a config file for each of your services.  LinuxServer.io provides a lot of example templates but here is a basic example of one of my config files.  NGINX will have to be restarted after the changes.

fruity.pebbels.conf
```nginx
server {
    listen 80;
    listen [::]:80;

    server_name fruity.pebbels;

    client_max_body_size 0;

    location / {
        include /config/nginx/proxy.conf;
        include /config/nginx/resolver.conf;
        set $upstream_app 192.168.50.13;
        set $upstream_port 8989;
        set $upstream_proto http;
        proxy_pass $upstream_proto://$upstream_app:$upstream_port;

    }

    location ~ (/sonarr)?/api {
        include /config/nginx/proxy.conf;
        include /config/nginx/resolver.conf;
        set $upstream_app 192.168.50.13;
        set $upstream_port 8989;
        set $upstream_proto http;
        proxy_pass $upstream_proto://$upstream_app:$upstream_port;

    }
}
```

### Configure Access Controls
You'll want to make sure that not just anyone connected to your Tailscale network can access your services.  You can configure access controls to limit who can access what.
1. Go to the Access Controls page [https://login.tailscale.com/admin/acls/visual/general-access-rules](link)
2. Under the groups tab create a group for the users you want to give access and add the users.  I just called my group NGINX so it's easy to understand what it's for.
3. Go to the hosts tab and create a host for your NGINX container using the IP address of your NGNINX host listed on the machines page.
4. Go to the general access rules tab
    - Make sure you don't already have a rule that gives access to all users.  I had one by default that I limited to only my account.
    - Create a new rule allowing access for only your NGINX group to the NGINX host.

### Success!!
You should be all set. You can test by connecting to Tailscale on your device and accessing your custom URL like fruity.pebbels . 
