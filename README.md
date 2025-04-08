<div align="center">

# An Analytics Open Interest Telegram Bot

[![https://oi-bot-web.vercel.app](https://res.cloudinary.com/maxigord/image/upload/v1744070305/oi%20tg%20bot%20web/a-dashboard-interface-for-a-telegram-bot_7IZoC8XzQO29Xl5xbop8HA_YWWFoy6kRU2koaEzyzBBLA_rannbb.jpg)]()

</div>

## 1. Set Up AWS EC2 Instance
* Sign in to the AWS Management Console and navigate to EC2
* Click `Launch instance`
* Enter a name for your instance (e.g., `telegram-bot-server`)
* Select `Amazon Linux 2023 AMI` as the OS
* Choose instance type: `t2.micro (free tier eligible)`
* Create or select a key pair (you'll need this to SSH into your instance)
* Under Network settings: `allow SSH traffic from your IP address or if you'll need direct web access, allow HTTP/HTTPS`
* Configure storage (default 8GB is usually sufficient)
* Click `Launch instance`

## 2. Connect to your AWS EC2 Instance
* Open terminal in the project directory with ssh `your-key.pem`, run:
```ssh
chmod 400 /path/to/your-key.pem
```
* Connect to your instance accepted authenticity, run:
```ssh
ssh -i /path/to/your-key.pem ec2-user@your-instance-public-ip
```
###### where `/path/to/your-key.pem` security key to instance 
###### where `your-instance-public-ip` is Public IPv4 address

## 3. Update the System
###### _Once connected, first update all packages_
```sudo
sudo dnf update -y
```

## 4. Install Dependencies on AWS EC2 Instance
* Install NVM
###### _Amazon Linux doesn't come with the latest Node.js version by default_
```curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```
* Activate NVM in current session
```source
source ~/.bashrc
```
* Install Node.js v18 (or your preferred version)
```source
source ~/.bashrc
```
* Verify installation
```
node -v
npm -v
```
* Install PostgreSQL client tools
###### _Connection to your PostgreSQL database_
```sudo
sudo dnf install -y postgresql15
```
* Install PM2 for Process Management
###### _PM2 will keep your bot running and restart it if it crashes_
```sudo
npm install -g pm2
```
* Install Git
###### _Make possible to deploying your code_
```sudo
sudo dnf install -y git
```

## 5. Setting Up PostgreSQL
1. Go to the RDS console in AWS
2. Click `Create database`
3. Select PostgreSQL as the engine
4. Choose `Free tier` for testing or `Standard` for production
5. Set DB instance identifier (e.g., `telegram-bot-db`)
6. Set master username and password
7. Under connectivity, select your VPC and security group (create a new one if needed)
8. Make sure to configure the security group to allow inbound connections from your EC2 instance
9. Click `Create database`

* Test Connection from EC2 to RDS
1. Visit ASW Console -> Connectivity & Security, copy endpoint ends on `.rds.amazonaws.com`
```psql
psql -h your-rds-endpoint.rds.amazonaws.com -U postgres -d postgres
```
###### _Enter the password when prompted_
###### where _-U postgres_ is username of database
###### where _-d postgres_ is name of database
###### enter  _\q_ is database exist

## 6. Deploying Your Bot
* Clone Your Repository:
```bash
git clone https://your-repo-url.git
```
* Visit directory just cloned:
```bash
cd ~/telegram-bot
```
* Install Dependencies:
```bash
npm install
```
* Create Environment Configuration:
###### _copy/paste everything from local .env_ to aws instance .env
```bash
nano .env
```
###### _Save and exit (Ctrl+X, then Y, then Enter)_

## 7. Test Your Bot Manually
* Before setting up PM2, test if your bot runs correctly:
```bash
node index.js
```

## 8. Running Your Bot with PM2
* Start your bot with PM2, run:
```bash
pm2 start index.js --name telegram-bot
```
* Check if it's running:
```bash
pm2 status
```
* Configure PM2 to Start on Boot, run:
```bash
pm2 startup
```
* Save the current PM2 processes, run:
```bash
pm2 save
```

## 9. Securing Your EC2 Instance
* Install firewall, run:
```json
sudo dnf install -y firewalld
```
* Start and enable the firewall, run:
```json
sudo systemctl start firewalld
sudo systemctl enable firewalld
```
* Allow SSH, run:
```json
sudo firewall-cmd --permanent --add-service=ssh
```
* If you're running a web server for webhooks, allow HTTP/HTTPS, run:
```json
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
```
* Reload the firewall to apply changes, run:
```json
sudo firewall-cmd --reload
```

## 10. Keep Your System Updated
* Install automatic updates, run:
```json
sudo dnf install -y dnf-automatic
```
* Configure automatic updates, run:
```json
sudo nano /etc/dnf/automatic.conf
```
* Make sure the following are set, run:
```json
apply_updates = yes
emit_via = stdio
```
* Save and exit, then enable and start the service, run:
```json
sudo systemctl enable --now dnf-automatic.timer
```

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

### Features
* Track real-time price changes for up to 200 cryptocurrencies on Binance.
* Notify users via Telegram when percentage thresholds (e.g., 5%, 10%, 15%) are reached.
* User-defined thresholds upon starting the bot.

### Requirements
* AWS EC2 Instance (Linux).
* Node.js (v20.x or later).
* Telegram Bot Token from BotFather.
* PostgreSQL database for storing user configurations.
