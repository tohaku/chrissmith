+++
title = "Hello World!" 
description = "First blog post of new site" 
tags = [ "personal","hugo","idx","cloudflare",] 
date = "2025-04-15" 
categories = [ "personal",]
+++

👋 Hello!  Welcome to my blog / personal website.  If you have already guessed from the URL - which I was pretty lucky to snag ([chris-smith.net](http://chris-smith.net)) - I’m Chris.  I created this site to record and share the various projects I might be working on or things that I’m learning.  It’ll help chart my growth in different areas but also be a cool little time machine to look back.  Over the years, I’ve worked on tons of projects that were eventually scrapped — and I regret not saving anything to look back on.  But it’s not all work — this will also be a spot to share travels, games, or movies I’m currently obsessed with.

Thank you for dropping by and skimming what I’ve written.  If you’re curious of what cool tech I’m playing with for this site continue reading!

### Hugo

This website is built using [Hugo](https://gohugo.io/) which is a website framework written in Go.  I love the simplicity Hugo brings when compared with sites like Wordpress, Ghost, or Squarespace. 

### Cloudflare Pages

[https://pages.cloudflare.com](https://pages.cloudflare.com)

It’s free!!!  Cloudflare is an amazing platform that offers a lot of tools for home lab enthusiasts that are free and enhance security for your hosted services.  They offer a service for hosting static websites (supports Hugo) for free and you can point your own custom domain to it. Another cool thing is you can point it to Github so any change to your sites code is automatically recompiled and displayed on the website.

### Google IDX / Firebase Studio

[https://studio.firebase.google.com/](https://studio.firebase.google.com/)

This is a really cool tool that is basically an IDE in your browser that has AI (Google Gemini) and version control built in.  It also has a terminal so even though my code is remotely on that site I can still run hugo server -D and preview the changes I made to my website temporarily.  

The builtin AI works really well.  I can ask it a question like “why is this still black” and it’ll go through all of the project files and give an explanation to why it’s black as well as a possible fix. This has really helped me save time and track down something that might be buried that I might never have found.  It also has a cool ability for all of the “vibe coding” that’s trending.  You can start off your coding project with a prompt and Google IDX (Firebase now) will present to you a blueprint breaking down everything you requested.  You have the ability to ask the AI to modify the blueprint.  Once you’re satisfied with the blueprint and click go, the AI starts coding all of the files it thinks you need.

I’m planning a future project where I want to prompt for a chess teaching application.  I want the ability to modify the pieces and board with my own sprites and have AI integration by having the user supply an API key for their AI of choice

### Projects in the pipeline

Some projects I’m currently working on that I may blog about in the near future

- **🤖Chess application:** try my hand at “vibe coding” which is prompting ai to code an application. For this I’m looking to have the ability to use my own custom sprites for chess pieces and board that can be swapped out easily as well as have ai integration.
- **🎮 Adventure Land MMORPG:**  A game a wish I had as a kid and wish I had found sooner since it hasn’t been updated in 2 years.  It’s a top down MMO similar to Ragnarok, but the idea behind it is you code your character or characters (you can run multiple at the same time) actions.  Currently I have grouping and follow logic done but I’m excited to expand that.