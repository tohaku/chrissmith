---
title: "Towel on the Sunbed"
date: 2026-08-03
difficulty: Medium
tags:
  - ctf
  - writeup
  - TryHackMe
  - Web
  - Business Logic
  - Burp Suite
  - API
draft: false
description: "Hacker Holidays 2026 - Day 8"
---

# Towel on the Sunbed

## Overview

Day 8 of THM Hacker Holidays 2026 - [link](https://tryhackme.com/room/hh-towelonthesunbed-61271709)

Towel on the Sunbed is a web application challenge involving authenticated functionality, account progression, and access to a protected vault.

Can you figure out a way to open the whale vault revealing the flag?

## TLDR what as the vulnerability

> **Vulnerability:** Race condition / time-of-check to time-of-use issue
> 

> **Affected endpoint:** `POST /claim`
> 

> **Impact:** Unauthorized balance inflation and access-control bypass
> 

## Target Information

```
Application: http://10.145.159.182:3000
Platform: Node.js / Express
Testing tools: DIRB, browser developer tools, Burp Suite
```

## Reconnaissance

The first thing you'll notice when accessing the site is it's possible to create a user account which'll give you instant access to the site.  This was useful because I created around 5 user accounts in my testing before I found the flag.  This happened because any time I used Claim, that account was basically stuck for 2 hours before it could use Claim again.

In addition to getting logged in I also enumerated common paths with DIRB:

```bash
dirb http://10.145.159.182:3000 /usr/share/dirb/wordlists/common.txt
```

The scan identified the following endpoints:

```
/css
/dashboard
/js
/vault
```

/vault was the most useful. You can see everything stored in json including the time variable and the variable that locks the claim function.

<img src="https://cdn.chris-smith.net/TryHackMe/Screenshot-2026-08-03-at-7.48.57%E2%80%AFPM-97f70fd6.png" alt="VaultJson" style="display:block; max-width:100%; height:auto;" loading="lazy" />

## Application Analysis

After signing in, I reviewed the dashboard and its client-side source code. The application called the following endpoint to retrieve information about the current user:

```
GET /dashboard/api/me
```

The dashboard also contained a **Claim Reward** button. Clicking it awarded 50 `ponzi` to the account. Once the account reached the Whale tier at 150 `ponzi`, the vault became available.

The browser generated the following request when the reward button was clicked:

```
POST /claim HTTP/1.1
Host: 10.145.159.182:3000
Accept: */*
Referer: http://10.145.159.182:3000/dashboard
Origin: http://10.145.159.182:3000
Cookie: connect.sid=<redacted-session-cookie>
Content-Length: 0
```

## Vulnerability Hypothesis

Claim function logic

```
1. Check if already claimed
2. Add 50 to the user's balance.
3. Set time limit until user can clam again
4. Set lock variable
```

This room immediately gave me deja vu from a previous CTF I'd done but I couldn't put my finger on it.  Upon sharing the json from /vault Claud was what spotted a race condition which was what I was trying to remember.

## Exploitation

<img src="https://cdn.chris-smith.net/TryHackMe/Screenshot-2026-08-03-at-8.30.44%E2%80%AFPM-3a8a0987.png" alt="Burp" style="display:block; max-width:100%; height:auto;" loading="lazy" />

To exploit a race condition I intercepted the `POST /claim` request in Burp Suite and sent it to Repeater. I then duplicated the request 15 times and placed the copies into a tab group.

Using the **Send group in parallel** option, I sent all requests to the server and crossed my fingers that they all had successfull responses from the server.

It was a success and each of those requests added another 50 `ponzi` to the same account. Because the requests reached the vulnerable code path at nearly the same time, multiple requests passed the reward eligibility check.

One of the responses showed that the balance had reached 750:

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8

{
  "message": "Staking reward claimed successfully.",
  "reward": 50,
  "newBalance": 750,
  "tier": "Whale",
  "priceSnapshot": 4.2
}
```

## Retrieving the Flag

After refreshing the dashboard, the account was recognized as a Whale-tier user. The Whale Vault could then be opened, revealing the challenge flag.

<img src="https://cdn.chris-smith.net/TryHackMe/Screenshot-2026-08-03-at-8.31.04%E2%80%AFPM-483de957.png" alt="flag" style="display:block; max-width:100%; height:auto;" loading="lazy" />