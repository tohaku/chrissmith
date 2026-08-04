+++
title = "Defcon 2026 - Meshnet Setup" 
description = "Setting up a Lora 32 v4 with Meshnet" 
tags = [ "defcon","personal","meshnet",] 
date = "2026-08-03" 
categories = [ "personal",]
image="https://cdn.chris-smith.net/projects/meshtastic/Screenshot-2026-08-03-at-10.43.23%E2%80%AFPM-364e45c2.png"
draft=false
+++

## Resources:

Lora 32 v4 kit: [Link] (https://www.amazon.com/dp/B0FRS7H1FT?ref_=ppx_hzsearch_conn_dt_b_fed_asin_title_1&th=1)
3D Print Case: [Link] (https://www.printables.com/model/1524638-3d-printed-case-for-heltec-v4gps)
Setup Guide: [Link] (https://lonelyhackers.club/meshtastic/)

## What is it

<img src="https://cdn.chris-smith.net/projects/meshtastic/Screenshot-2026-08-03-at-10.44.08%E2%80%AFPM-e530f278.png" alt="kit" style="display:block; max-width:100%; height:auto;" loading="lazy" />

Meshtastic is an open-source, off-grid messaging system that uses low-power LoRa radios to create a decentralized mesh network without cellular service or Wi-Fi. 

At Defcon there will be people there using it to communicate with friends, experiment with nearby nodes.

## Physical Setup

<img src="https://cdn.chris-smith.net/projects/meshtastic/Screenshot-2026-08-03-at-10.43.39%E2%80%AFPM-a7e7ca80.png" alt="connected" style="display:block; max-width:100%; height:auto;" loading="lazy" />

The physical connections of the device were very straight forward.  There were clearly marked ports to connect the GPS and 3000mah battery to without needing any soldering.  There was also a port for the antenna.

## Software Setup

I followed the Lonely Hackers Guide [Link] (https://lonelyhackers.club/meshtastic/) to setup the device.  I opted not to use Defcon's firmware and used the firmware from Meshnet's website.

For flashing I installed esptool.py and used the firmware ```firmware-esp32s3-2.7.26.54e0d8d```

<img src="https://cdn.chris-smith.net/projects/meshtastic/esptool-0a145f1d.png" alt="esptool" style="display:block; max-width:100%; height:auto;" loading="lazy" />

## 3D print case

I went through a couple of cases before settling on [this] (https://www.printables.com/model/1524638-3d-printed-case-for-heltec-v4gps) one.  There are a couple of open spots, one for the Lora board buttons and one to help fit the GPS module but I didn't mind the exposed electronics.

<img src="https://cdn.chris-smith.net/projects/meshtastic/3dprintlora-227b0c0e.png" alt="3dprint" style="display:block; max-width:100%; height:auto;" loading="lazy" />

## Configuring channels

Meshtastic has apps for iPhone, Android, MacOS and Windows.  You can use those apps to configure your settings as well as communication channels.

In the Lonely Hackers guide they have all of the information needed to add channels specifically for defcon.
