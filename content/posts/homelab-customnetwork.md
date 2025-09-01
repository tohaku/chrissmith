+++
title = "Home Lab - Custom Network"
description = "Creating a custom docker network"
date = "2025-09-01"
draft = false
tags = ["homelab", "docker", "unraid","unifi"]
categories = ["HomeLab"]
image="https://cdn.chris-smith.net/homelab/customnetwork/banner.png"
+++
## What is a custom network

A custom network is a docker network that is bridged to a physical Unraid interface or VLAN interface on the host.  In this use case we’ll be setting up an ipvlan where all containers will have different IPs but share the same host MAC address.  This was done to avoid issues with MacVLANs in older Unraid versions and to keep it consistent with my other custom networks.

## Use case

We’re creating an isolated VLAN for containers that should be extra locked down, like databases.  Only specific services will be granted access to containers on this network using firewall rules and this network will also be blocked from access to the internet.  Since containers are updated on the Unraid host itself and they’re just databases, blocking internet access should have no affect on anything.

## Creating a new VLAN in Unifi

Login to your Unifi network by browsing to it’s IP

Go to Settings → Networks → New Virtual Network
{{<figure src="https://cdn.chris-smith.net/homelab/customnetwork/securenetwork.png" alt="network setup" caption="VLAN 8 Secure network setup in Unifi">}}
Fill out the following details

- Name: Secure
- Host Address: 192.168.80.1
    - I keep the netmask of 24 the same
    - This will auto populate other fields such as Gateway IP
- VLAN ID: 8
- Check only Isolate network so firewall rules are automatically created to block my other VLANs from accessing this.  Future firewall rules can be created to poke holes and let other services access containers on this network.
- Uncheck all boxes including internet access in this use case.  Containers on this network have no need to connect to the internet and if they did that’s because they’ve probably been compromised.  Container updates are also done on the Unraid host itself so they won’t be blocked from upgrades.
- DHCP off , I like to specify my own static IPs when creating containers.
    - I keep my static IPs documented in Google Docs to prevent conflicts.  Unraid will stop you if you do try to take an IP you’ve already used.

{{<figure src="https://cdn.chris-smith.net/homelab/customnetwork/autofirewallrules.png" alt="Firewall rules" caption="Firewall rules that were automatically created">}}
{{<figure src="https://cdn.chris-smith.net/homelab/customnetwork/autofirewallrules2.png" alt="Firewall rules" caption="Firewall rule details blocking access between VLANs">}}

## Creating an ipvlan network in Unraid

I like to use an ipvlan network for Unraid because I can control access via my Unifi network system

### Disable Docker and VM Manager

- I like to stop all containers and VMs manually first before disabling the services in the Unraid settings.
- Disable docker
    - Settings → Docker
    - Enable Docker → set to no → click apply
- Disable VMs
    - Settings → VM Manager
    - Enable VMs → set to no → click apply

### Add the VLAN in Unraids network settings

- Go to network manager and next to enable VLANs make sure it’s marked yes, then click the show button
- Click ADD VLAN
- Fill out the new VLAN info
    - Interface description: Secure
    - VLAN Number: 8
    - Network protocol: IPv4 only
    - IPv4 address assignment: none
- Click Apply
{{<figure src="https://cdn.chris-smith.net/homelab/customnetwork/unraidnetwork.png" alt="unraid network" caption="Visual of the new VLAN settings in Unraids network settings">}}


### Add the network to the Unraid docker settings

- Settings → docker
- Docker should still be disabled
- Docker custom network type should be ipvlan
- At the bottom of the page you should see our new interface and in this case it’s br0.8 and it’s disabled.
    - Subnet: 192.168.80.0
    - Gateway: 192.168.80.1
- Click Apply.
- You should now see a new custom ipvlan network (br0.8) appear as a dropdown option when creating containers.

{{<figure src="https://cdn.chris-smith.net/homelab/customnetwork/unraiddockernetwork.png" alt="unraid docker network" caption="Visual of network settings for docker">}}

### Bring everything back online

- Re-enable docker
    - Settings → Docker
    - Enable Docker → set to yes → click apply
    - Containers should auto-start if that is enabled
- Re-enable VMs
    - Settings → VM Manager
    - Enable VMs → set to yes → click apply
    - VMs should auto-start if that is enabled