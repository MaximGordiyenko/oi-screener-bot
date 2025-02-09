# Open Interest Telegram Bot

###### A Telegram bot for monitoring cryptocurrency price changes on Binance in real-time. The bot notifies users when price changes exceed user-defined thresholds.

### Features

* Track real-time price changes for up to 200 cryptocurrencies on Binance.
* Notify users via Telegram when percentage thresholds (e.g., 5%, 10%, 15%) are reached.
* User-defined thresholds upon starting the bot.

### Requirements

* AWS EC2 Instance (Ubuntu).
* Node.js (v18.x or later).
* Telegram Bot Token from BotFather.
* PostgreSQL database for storing configurations.

### Deployment Instructions

## 1. Set Up AWS EC2 Instance

* Launch an EC2 instance from the AWS Console.
* Choose Ubuntu 24.04 LTS as the AMI.
* Configure the instance type (e.g., t2.micro for free tier eligibility).
* Create or use an existing key pair to connect to the instance.
* Launch the instance and connect via SSH:

`ssh -i "your-keypair.pem" ubuntu@<your-ec2-public-ip>`

## 2. Install Dependencies on EC2

* Update System and Install Tools

`sudo apt update && sudo apt upgrade -y`

`sudo apt install -y curl git`

* Install Node.js and NPM
  `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
  `sudo apt install -y nodejs`
