+++
title = "OIDC - PocketID"
description = "OIDC Authentication using passkeys"
date = "2025-10-05"
draft = false
tags = ["homelab", "docker", "unraid","oidc"]
categories = ["HomeLab"]
image="https://cdn.chris-smith.net/homelab/pocketid/banner.png"
+++

## What is Pocket ID

Pocket ID is a provider that handles logins using passkeys instead of passwords. It runs as an OpenID Connect (OIDC) provider, which means apps that support OIDC or external SSO can hook into it and let me log in securely without ever dealing with a username or password.

## Resources

Github: [https://github.com/pocket-id/pocket-id](https://github.com/pocket-id/pocket-id)

Documentation: [https://pocket-id.org/docs](https://pocket-id.org/docs)

Geolite key: [https://www.maxmind.com/en/geolite2/signup](https://www.maxmind.com/en/geolite2/signup)

Pocket ID has an official Docker container in Apps in Unraid

## Initial Setup

### GeoLite

- Sign up on the linked site for a GeoLite database key. Without it, you won’t see IP locations in your logs.
    - [https://www.maxmind.com/en/geolite2/signup](https://www.maxmind.com/en/geolite2/signup)
- Log in to [maxmind.com](http://maxmind.com) after your account is created
- Click Manage license keys
- Create license key
- Specify a name. I like to put the name of the container I’m using the key for
- Keep this page open so you can copy and paste the key into your container variable

### Container Setup

- Using the official Docker container in Unraid for this setup
    - Search the Apps tab for Pocket ID to find it
- Kept most values at default except for the below
    - Changed network type to a custom network for web‑facing containers
    - Changed app URL
    - Set Behind Proxy to true for NGINX
    - Input MaxMind license key from earlier
    - I kept the default SQLite database that’s part of the container. The only external database option Pocket ID works with is PostgreSQL, so it won’t work with my existing MariaDB database
- Submit and view container logs for any errors

### Proxy Setup

I use SWAG from LinuxServer ([link](https://docs.linuxserver.io/images/docker-swag/)). As of this writing they don’t have a template NGINX config for Pocket ID, so we’ll be creating our own.

#### Steps

- Copied proxy.conf and created a new file proxypocketid.conf
    - Pocket ID’s documentation mentions needing larger proxy buffers than what’s in the standard proxy.conf file. Increasing those in the proxy.conf file could cause issues with other sites, so it’s better to just create a whole new config file
- Added the below proxy buffers to our new config file
    - proxy_busy_buffers_size   512k;
    - proxy_buffers   4 512k;
    - proxy_buffer_size   256k;
- Removed the old proxy_buffers value
- Created a new NGINX config for Pocket ID. Example of my config is below. This config also includes the previous config file we created
- Restart the SWAG container and view the logs for any issues

#### Nginx config files

proxypocketid.conf

```yaml
## Version 2023/02/09 - Changelog: [https://github.com/linuxserver/docker-swag/commits/master/root/defaults/nginx/proxy.conf.sample](https://github.com/linuxserver/docker-swag/commits/master/root/defaults/nginx/proxy.conf.sample)

# Timeout if the real server is dead
proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;

# Proxy adjustments per Pocket ID documentation
proxy_busy_buffers_size   512k;
proxy_buffers   4 512k;
proxy_buffer_size   256k;

# Proxy Connection Settings
#proxy_buffers 32 4k;
proxy_connect_timeout 240;
proxy_headers_hash_bucket_size 128;
proxy_headers_hash_max_size 1024;
proxy_http_version 1.1;
proxy_read_timeout 240;
proxy_redirect http:// $scheme://;
proxy_send_timeout 240;

# Proxy Cache and Cookie Settings
proxy_cache_bypass $cookie_session;
#proxy_cookie_path / "/; Secure"; # enable at your own risk, may break certain apps
proxy_no_cache $cookie_session;

# Proxy Header Settings
proxy_set_header Connection $connection_upgrade;
proxy_set_header Early-Data $ssl_early_data;
proxy_set_header Host $host;
proxy_set_header Proxy "";
proxy_set_header Upgrade $http_upgrade;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Method $request_method;
proxy_set_header X-Forwarded-Port $server_port;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Server $host;
proxy_set_header X-Forwarded-Ssl on;
proxy_set_header X-Forwarded-Uri $request_uri;
proxy_set_header X-Original-Method $request_method;
proxy_set_header X-Original-URL $scheme://$http_host$request_uri;
proxy_set_header X-Real-IP $remote_addr;
```

Nginx Config

```yaml
# Redirect HTTP → HTTPS (SWAG terminates TLS)
server {
    listen 80;
    listen [::]:80;
    server_name [dashboard.chris-smith.net](http://dashboard.chris-smith.net);
    return 301 [https://$host$request_uri](https://$host$request_uri);
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name [dashboard.chris-smith.net](http://dashboard.chris-smith.net);

    # SWAG SSL & security presets (HSTS, modern ciphers, etc.)
    include /config/nginx/ssl.conf;

    # Allow larger OIDC POSTs
    client_max_body_size 10m;
    
    

    location / {
        # SWAG proxy defaults: X-Forwarded-* headers, websockets, timeouts, etc.
        include /config/nginx/proxypocketid.conf;
        # Uses Docker DNS if SWAG runs in a Docker network
        include /config/nginx/resolver.conf;

        # Upstream to the Pocket ID container
        set $upstream_app 192.168.40.5;   # container name or service DNS
        set $upstream_port 1411;      # Pocket ID’s internal port
        set $upstream_proto http;

        proxy_pass $upstream_proto://$upstream_app:$upstream_port;
    }
}
```

### Configure DNS

- Set up a static local DNS record
    - Routes traffic internally without needing to go out to the internet
- Set up a DNS record in Cloudflare
    - Routes traffic from the internet over Cloudflare tunnel

## Configuring Pocket ID

### Admin Account Setup

- Browse to https://{your-site-domain}/setup
- Enter your account information
- Add passkey
    - Works with your password manager, browser, or hardware passkeys like YubiKeys

### Block signups page with NGINX

Despite completing the initial admin setup and disabling the option for future users to go through the signup page, it was still visible. Blocking this page by adding the below location block to the Pocket ID NGINX config

```yaml
location /signup/setup {
        deny all;
        return 404;
    }
```

## Setup your apps

### Romm

Romm documentation: [https://docs.romm.app/3.8.3/OIDC-Guides/OIDC-Setup-With-PocketID/](https://docs.romm.app/3.8.3/OIDC-Guides/OIDC-Setup-With-PocketID/)

#### What is it

Romm is an amazing browser‑based ROM and emulator application. It acts as a ROM management system pulling in metadata from different gaming databases and also lets you play most old ROMs in the browser.

#### Setup Steps

Pocket ID add OIDC client

- In settings go to application configuration → tick “Emails Verified”
- OIDC Clients
- Click Add OIDC Client button
- Fill out Name and Client Launch URL
    - Name: Romm
    - Client Launch URL: https://{domain}/api/oauth/openid
- Click Save
- Make a note of the client ID and Secret. You won’t see it after the page refreshes

Configure Romm container

I already had a container so I added these variables to my existing one.

- Add these environment variables to the romm container
    - OIDC_ENABLED: true
    - OIDC_PROVIDER: pocketid
    - OIDC_CLIENT_ID: client id saved from pocket id
    - OIDC_CLIENT_SECRET: client secret saved from pocket id
    - OIDC_REDIRECT_URI: https://{domain}/api/oauth/openid
    - OIDC_SERVER_APPLICATION_URL: https://{pocket ID URL}
        - NOTE!! This differs than ROMM’s documentation. Using /authorize at the end of the domain gave me a 200 error.
- Submit and view the logs for any errors

Configure Romm

- Make sure email for your email address matches the email used in Pocket ID

Test

- Romm now shows an option to log in with Pocket ID in addition to the typical username/password

### NextCloud

Enable OpenID Connect Login

- Nextcloud → Apps → Integration → OpenID Connect Login (official)
- Click allow untested app if it says that
- Followed by Download and enable

Browse to this URL and save the information for later

https://<pocketid>/.well-known/openid-configuration

Configure PocketID

- Go to pocketID → Settings
- OIDC Clients
- Add OIDC client
- Settings to configure
    - Name = Nextcloud
    - Client Launch URL = [https://nextcloud.smithc.net](https://nextcloud.smithc.net)
    - Callback URL = [https://nextcloud.chris-smith.net/apps/oidc_login/oidc](https://nextcloud.chris-smith.net/apps/oidc_login/oidc)
    - Logout Callback URL = https://<your-nextcloud-domain>/index.php/logout
    - Click Save → don’t close this page!
    - Save Client ID & Client Secret for later

Configure Nextcloud

It’s time to input all of the information we’ve saved into Nextcloud’s config.php file

```yaml
'oidc_login_provider_url' => '[https://pocketid.chris-smith.net](https://pocketid.chris-smith.net)',
'oidc_login_client_id' => 'nextcloud',   // replace with your client ID
'oidc_login_client_secret' => 'YOURSECRET',
'oidc_login_end_session_redirect' => true,
'oidc_login_scope' => 'openid profile email',
'oidc_login_match_email' => true,
'oidc_login_attributes' => [
    'id'    => 'sub',
    'name'  => 'name',
    'mail'  => 'email',
],
'redirectUri' => '[https://nextcloud.chris-smith.net/apps/oidc_login/oidc](https://nextcloud.chris-smith.net/apps/oidc_login/oidc)',
'autoRedirect' => 'true',
```

I enabled account creation based on PocketID login by running the below command in the Unraid terminal

```yaml
docker exec Nextcloud php occ config:system:set oidc_login_disable_registration --value=false --type=boolean
```

Nextcloud should now have an OpenID Connect button that redirects to PocketID for authentication. If a user doesn’t exist it creates one.

## Troubleshooting

### Logs

Romm logs

```yaml
docker logs -f romm
```
