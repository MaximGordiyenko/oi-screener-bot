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

## 🛠️ Why Do We Need Approve/Deny Functionality?

The **_approve/deny_** functionality is crucial for controlling who can receive cryptocurrency notifications from the bot.
Without it, anyone could join and get real-time alerts, which might not be desirable for a private or premium service.

### 🔍 The Core Logic

#### User Requests Access (/start)
* A user sends the /start command.
* If they are not in the database, they are added with approved = false.
* The bot replies: "Request sent to the admin. Please wait for approval."
* If they already exist, they get: "You have already requested access."
* Admin Approves (/approve <userId>)
* The bot owner sends /approve <userId>.
* The bot updates the user’s status in the database to approved = true.
* The bot notifies the user: "You have been approved! You will now receive updates."
* Now, the user will receive real-time crypto alerts.

#### Admin Denies (/deny <userId>)
* The bot owner sends /deny <userId>.
* The bot removes the user from the database.
* This ensures the denied user does not take up storage or resources.
* Only Approved Users Get Notifications
* The Binance WebSocket listens for price updates.
* Every time there is a price update, the bot checks the database.
* Only users with approved = true receive messages.

### 1️⃣ Prevents Unauthorized Access
Without approval, anyone could start receiving crypto updates.
This prevents spam and keeps the bot exclusive.

### 2️⃣ Controls Load on the Bot
Sending messages to thousands of users could slow down or get rate-limited by Telegram.
By approving only selected users, we optimize performance.

### 3️⃣ Allows a Premium Subscription Model
If you want to monetize the bot, you can charge for access.
Only paid users get approved, and others get denied.
🔥 Example Scenario

#### 📌 Without Approval System
Spam users join and overload the bot.
Telegram blocks the bot for sending too many messages.
Unwanted users abuse free real-time crypto alerts.
#### 📌 With Approval System
Users request access → Admin reviews requests.
Only trusted users receive updates.
The bot remains efficient, secure, and exclusive.
🚀 Future Enhancements

Add an admin panel (React/Vue + Node.js backend).
Store user preferences (e.g., notify only if price changes by 5%).
Charge a subscription fee for access.
