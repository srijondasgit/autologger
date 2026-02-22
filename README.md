# autologger
![img2](https://github.com/user-attachments/assets/d64aff16-3761-4d05-8f0a-ef2ccd7ab5c0)



You have meters, they have numbers. You have a phone. We connected the dots so you don't have to log the numbers manually.  
Because squinting at a blinking number and then immediately forgetting it is not a sustainable business process.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Works on my phone](https://img.shields.io/badge/works-on%20my%20phone-brightgreen)](.)
[![No cloud](https://img.shields.io/badge/cloud-absolutely%20not-red)](.)
[![Powered by squinting](https://img.shields.io/badge/powered%20by-squinting-yellow)](.)

---


## The Problem

You have meters. Lots of meters. They blink numbers at you. You walk up to them with a clipboard, squint, write the number down, walk to the next one, forget the first number, walk back, squint again, write the wrong number, hand it to someone, they type it into Excel wrong, and now your boss thinks Pump 3 is producing 9999 litres per hour instead of 99.9.

This has been the state of industrial meter reading since 1987.

**We fixed it.** Kind of. With a phone camera and some heroic amounts of JavaScript.

---

## What is autologger?

autologger is a **free, open-source, runs-in-your-browser, no-app-needed, no-account-required, no-data-leaves-your-phone** tool for reading digital displays using your phone camera and saving them into a neat table.

Point camera. Tap number. Move to next meter. Repeat. Get table. Go home early.

It uses **Tesseract.js** for OCR (the same engine that has been reading text since before your interns were born) and runs 100% client-side. Your meter readings go nowhere except into a local table and, if you want, a CSV you can paste into whatever spreadsheet your company refuses to upgrade from 2003.

---

## Features

### 🏭 Multi-Meter Support
Name up to **10 meters** per session. Call them whatever you want — `PUMP A`, `BOILER 2`, `THAT ONE IN THE CORNER`, `DAVE'S METER` — up to 10 characters. Navigate between them with numbered dots because we're fancy like that.

### 🕐 Smart Session Naming
Label each round of readings by:
- **24-hour time** — `14:00` (for people who have their life together)
- **12-hour time** — `2:00 PM` (for everyone else)
- **Custom label** — `BEFORE DAVE TOUCHED IT`, `AFTER INSPECTION`, `OOPS` — whatever you need

### 📊 Results Table
Every session becomes a row. Every meter becomes a column. The result is a beautiful table that would make your Excel-addicted colleague weep with joy. Export it as CSV in one tap.

### 📷 Smart OCR with Bounding Boxes
The camera scans your display, draws green boxes around every number it finds, and waits for *you* to tap the right one. Because OCR reading six numbers off a busy panel and auto-picking the wrong one would be worse than the clipboard you were using before.

### ⏸ Auto-Pause on Selection
Tap a number → camera freezes → value locks in → you move on with your life. No more blurry photos being re-analysed while you've already walked to the next meter. Resume scanning whenever you want.

### 🔦 Torch / Flashlight Support
For meters installed in locations that can only be described as *aggressively unlit*. Toggle it on, read the meter, toggle it off, pretend you planned it that way.

### 🔄 Front / Rear Camera Switch
Because sometimes the meter is behind a pipe and you need to contort yourself into an angle that requires the selfie camera. We support this without judgment.

### ✏️ Editable Values
OCR read `8` as `B`? (Classic.) Just tap the field and type the correct value. Your edit is preserved. The camera won't overwrite what you typed. We trust you more than the algorithm.

### 📐 Portrait & Landscape Friendly
Works in both orientations. In portrait the camera is capped so your buttons don't disappear off the bottom of the screen. Yes, this was a bug. Yes, it is fixed. Yes, it took longer than it should have.

### 🚫 No App. No Account. No Cloud. No Problem.
Open the HTML file. That's it. Your meter readings stay on your device. Nobody at some SaaS company is training an AI on the fact that your Boiler 2 ran at 4.7 bar on a Tuesday.

---

## Getting Started

```bash
# Step 1: Download the file
# (It's one HTML file. Yes, really.)

# Step 2: Open it in your phone browser
# (Chrome, Firefox, Safari — all work)

# Step 3: Allow camera permission
# (You kind of have to for a camera app)

# Step 4: Read meters
# Step 5: Profit (or at least submit accurate reports)
```

No `npm install`. No `docker-compose up`. No Kubernetes cluster. No microservices. No environment variables. One file. Open it.

---

## How It Works

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│  Page 1     │    │   Page 2     │    │   Page 3    │    │   Page 4     │
│             │    │              │    │             │    │              │
│ Name your   │───▶│ Name this    │───▶│ Point at    │───▶│ See your     │
│ meters      │    │ reading      │    │ display,    │    │ beautiful    │
│             │    │ (time/custom)│    │ tap number  │    │ table        │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
     Setup            Session             OCR + Lock           Results

```

![WhatsApp Image 2026-02-22 at 20 01 25](https://github.com/user-attachments/assets/b926a23f-2c5b-4894-bbf2-31c6dc684711)
![WhatsApp Image 2026-02-22 at 20 01 26-2](https://github.com/user-attachments/assets/821566f4-87e4-4329-bcb3-ba3a154f873d)
![WhatsApp Image 2026-02-22 at 20 01 26-3](https://github.com/user-attachments/assets/d96ace4e-7cc6-4798-bfbb-aee70ab9ebba)



1. **Setup** — Enter names for each meter you'll be reading  
2. **Session** — Pick a label for this round (start of hour, or custom)  
3. **Read** — Point camera at each meter display, tap the number you want, it locks and pauses  
4. **Done** — Hit "Save This Reading" and see your full table  

Repeat from step 2 next hour. Your table grows a row each time.

---

## Roadmap (a.k.a. The Wishlist)

Things we want to add, roughly in order of "will actually help people" vs "sounds cool in a README":

- [ ] **Custom scan regions**
- [ ] **Contrast enhancement**
- [ ] **7-segment display mode**
- [ ] **localStorage persistence**
- [ ] **Export to XLSX**
- [ ] **Trend charts**
- [ ] **Threshold alerts**
- [ ] **PWA / home screen install**
- [ ] **QR session sharing**
- [ ] **Photo attachment**
- [ ] **Bluetooth meter support**
- [ ] **Multi-language OCR**
- [ ] **MobileNet KNN classifier**

---

## Who Is This For?

| You are...                              | autologger helps because...                        |
|-----------------------------------------|---------------------------------------------------|
| A utilities field technician            | Your clipboard is from 2011 and has coffee on it |
| A factory floor supervisor              | You have 8 gauges and one intern                 |
| A facilities manager                    | Your boiler room has the lighting of a submarine |
| A lab technician                        | Manual transcription errors ruin experiments     |
| A small farm operator                   | Irrigation data shouldn't require enterprise SaaS|
| Someone who built a home energy monitor | You deserve a nice reading interface             |
| Dave                                    | We named a meter after you. You're welcome       |

---

## Contributing

Pull requests welcome. Please make sure your code:

- Works on a mid-range Android phone in Chrome  
- Does not require an npm install to use  
- Does not send any data anywhere  
- Does not make the buttons invisible  

Found a bug? Open an issue. Be specific about which phone, which browser, and orientation.

---

## Why Is This One HTML File?

Because the best deployment strategy is "send the file to someone on WhatsApp and it works". No hosting required. No CDN to go down. No dependency that gets abandoned in 6 months and breaks everything.

This is a **tool**, not a platform. Tools should be simple.

---

## License

Apache 2.0. Use it, modify it, ship it, build a business on it — just keep the attribution and don't sue us.

---

## Acknowledgements

- **Tesseract.js**
- **Every person who ever walked a meter route with a clipboard**
- **The Android Chrome team**
- **Dave**

---

*Made with 📟 and mild frustration*
