+++
title = "Wazuh Setup" 
description = "Setting up SIEM in my homelab" 
tags = [ "homelab","siem","wazuh","security",] 
date = "2026-01-04" 
categories = [ "homelab",]
image="https://cdn.chris-smith.net/homelab/wazuh/banner.png"
draft=true
+++

## What it is

## Setup Server

### VM or bare metal?

I decided to install Wazuh on a dedicated PC instead of a VM on my Unraid server.  I wasn't comfortable with having constant log read/writes on Unraids drives and I had an old Intel NUC collecting dust that was my original server I could use. A share will be created in Unraid to be used for backups though.  

It is possible to run Wazuh in a VM if you don't have the hardware and in total Wazuh's components (server, indexer, dashboard) needs about 4vCPUs and 8-16GB RAM.  You'll want to pass through a folder to store Wazuh's logs to instead of writing them inside of the VM.

Make sure you've also set a static IP for your VM or PC.

### Install Wazuh

Following Wazuh's quick start guide [here]("https://documentation.wazuh.com/current/quickstart.html"). This guide will automatically pull and install the 3 components needed for a server setup.

{{<figure src="https://cdn.chris-smith.net/homelab/wazuh/wazuhsetup.png" alt="wazuh setup" caption="Wazuh Setup in terminal with curl">}}

When the installation is complete, it'll provide a username and password for the web UI running on port 443. I like to setup custom domains for my services so I'll create a static DNS entry for this address as https://wazuh.internal.

### Post Setup

Upon logging into Wazuh's dashboard you'll already see some alerts that Wazuh is pulling from it's own logs.  But before I start playing around with it I

## User Agent Setup

What is the user agent?

From the Wazuh home screen click the blue deploy agent button.  This will take you to a screen where you can start filling out the different agent options like OS version, server address (IP or FQDN), agent name as it'll appear in the console, and device group.

One issue I ran into was Wazuh didn't like my naming scheme for internal FQDN's.  It gave an error saying that my FQDN was invalid.  So I used the Wazuh servers IP address.

After filling out the details you'll be provided with two commands to get the agent installed on the host. One command is to download the agent with curl and another to run the agent specific to the OS you selected. In this case it was MacOS.

```shell
#example curl command
curl -so wazuh-agent.pkg https://packages.wazuh.com/4.x/macos/wazuh-agent-4.14.1-1.arm64.pkg && echo "WAZUH_MANAGER='10.0.0.4' && WAZUH_AGENT_NAME='MyComputer'" > /tmp/wazuh_envs && sudo installer -pkg ./wazuh-agent.pkg -target /

#example command to run the agent on MacOS
sudo launchctl load /Library/LaunchDaemons/com.wazuh.agent.plist
```

## Integrations

### Unifi Network
Unifi has a setting to send it's logs to SIEM servers such as Splunk and Wazuh. This can be found under settings -> Control Plane -> Integrations tab
{{<figure src="https://cdn.chris-smith.net/homelab/wazuh/unifisettings.png" alt="unifi settings" caption="Unifi SIEM settings">}}

## Troubleshooting
