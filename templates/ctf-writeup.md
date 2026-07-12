---
title: "{{ challenge_name }} Writeup"
date: {{ date }}
tags:
  - ctf
  - writeup
  - {{ platform }}
  - {{ category }}
  - {{ operating_system }}
draft: true
description: "{{ one_sentence_summary }}"
---

# {{ platform }} - {{ challenge_name }}

> **Challenge Summary:** {{ short_summary }}
>
> Platform: {{ platform_url }}
> Category: {{ category }}
> Difficulty: {{ difficulty }}
> OS/Target: {{ operating_system }}

---

## Objective

{{ objective_or_goal }}

---

## Attack Flow

```
Recon -> Enumeration -> Exploitation -> Privilege Escalation -> Flags
```

---

## Setup

### Environment

- Attacker: {{ attacker_os }}
- Target: {{ target_ip_or_hostname }}
- VPN/Tunnel: {{ vpn_or_network_notes }}
- Tools: {{ tools_used }}

### Notes

{{ setup_notes }}

---

## Reconnaissance

### Port Scan

```bash
nmap -sC -sV -oN nmap.txt {{ target_ip }}
```

**Interesting results:**

```text
{{ notable_nmap_output }}
```

### Initial Findings

- {{ finding_1 }}
- {{ finding_2 }}
- {{ finding_3 }}

---

## Enumeration

### {{ service_or_feature }}

```bash
{{ enumeration_command }}
```

**Result:**

```text
{{ enumeration_output }}
```

**Takeaway:** {{ why_this_matters }}

---

## Exploitation

### Vulnerability

- Issue: {{ vulnerability_name }}
- Affected service: {{ affected_service }}
- Evidence: {{ proof_or_reference }}

### Exploit Steps

```bash
{{ exploit_command_or_steps }}
```

**Successful output:**

```text
{{ exploit_success_output }}
```

### Shell

```bash
{{ shell_upgrade_or_stabilization_commands }}
```

---

## Privilege Escalation

### Current Access

```bash
whoami
id
hostname
```

### Enumeration

```bash
{{ privesc_enum_commands }}
```

**Finding:** {{ privesc_finding }}

### Escalation

```bash
{{ privesc_commands }}
```

**Result:** {{ privesc_result }}

---

## Flags

| # | Location | Flag |
|---|----------|------|
| 1 | `{{ flag_1_location }}` | `{{ flag_1 }}` |
| 2 | `{{ flag_2_location }}` | `{{ flag_2 }}` |
| 3 | `{{ flag_3_location }}` | `{{ flag_3 }}` |

---

## Lessons Learned

- {{ lesson_1 }}
- {{ lesson_2 }}
- {{ lesson_3 }}

---

## Cleanup

```bash
{{ cleanup_commands }}
```

---

## References

- [{{ reference_title }}]({{ reference_url }})
