<div align="center">
In the name of God of the rainbow

<h1><img style="vertical-align:middle" src="https://user-images.githubusercontent.com/117530839/210110357-84313912-9748-4148-9d6a-3486bafa8a87.png"> Kian</h1>

[![](https://img.shields.io/github/v/release/bsimjoo-official/kian?include_prereleases&label=latest%20pre-release)](https://github.com/bsimjoo-official/kian/releases)
![GitHub Workflow Status (with branch)](https://img.shields.io/github/actions/workflow/status/bsimjoo-official/kian/Building%20and%20testing.yml?branch=main)
[![Code Style: Black](https://img.shields.io/badge/code%20style-black-000000)](https://github.com/psf/black)
[![Coverage](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbsimjoo-official%2Fkian%2Fmain%2Fcoverage-badge.json)](https://github.com/bsimjoo-official/kian/actions/workflows/Building%20and%20testing.yml)

Kian is an network-based program to help me and other teachers, with the aim of making students' attendance process smarter and faster.

This app will use an **Access-point** ([why?](#why-does-this-app-uses-an-access-point)) and Flask as HTTP backend.
Students should connect to the access point and enter server IP address in the browser, then for the first time they must submit their student number, application will save their MAC address and the student code for future.

https://user-images.githubusercontent.com/117530839/206903458-cf13800f-15a6-43e0-88d4-187c0e0cd1ca.mp4

*A demo of logging-in as BSimjoo*

</div>

## Why am I developing this software?
 - I'm a Teacher Assistant of Fundamental Programming course in Hormozgan University(Bandar Abbas, Hormozgan, Iran) and I have so many students in the class. So I needed such a software.
 - I wanted to create a software using Flask to learn it.
 - I believe I have something to say in Front-end development. In this project I tried to show my skills!

## Features
The Kian project has just started and has a good potential for development. Currently, the available features are as follows
 - Suitable for classes with a large number of students.
 - Simple and modern user interface.
 - Easy to use and set-up
 - Support for mobile phones
 - Ability to grade and announce grades
 - Registration of attendance history and the history of the device used
 - Prevent unauthorized registration of attendance for several students from one device ([Read more](#why-does-this-app-uses-an-access-point))

## Quick setup
### :inbox_tray: Clone repository and install requirements
The `main` branch always contain latest version.
```batch
git clone https://github.com/bsimjoo-official/kian.git
cd kian

pip install -r requirements.txt
# or 
pip install --user -r requirements
```

### :signal_strength: Opening hotspot on Windows
This app designed to use hotspot as a local network hosted by your system. This is needed to get devices mac address [read more](#why-does-this-app-uses-an-access-point).

First you should know that your wireless card supports hotspot or not.
```batch
netsh wlan show drivers
```
Then try to find `Hosted network supported`. If it is `Yes` so you can open a hotspot (or hosted network) and use this software. and if the answer is `No` unfortunately you can not use this app. To configure hotspot use following command:
```batch
netsh wlan set hostednetwork mode=allow "ssid=[YourHotspotName]" "key=[Password]"
```
now you can start hotspot:
```batch
netsh wlan start hostednetwork
```
To stop hosted network use
```batch
netsh wlan stop hostednetwork
```

### :school: Adding students
To add students there is a command interface `studutil.py` for importing an `excel` worksheet or manually add a student. I agree that this part of the software still needs works, but this project has been started for some time and this part will definitely improve in the future.

#### Loading an `.xlsx` file:
```
python studutil.py -l "[FILE PATH]"
```
Then software ask a range for student names and another for student numbers. these are columns (A,B,...) and rows (1,2,...) of worksheet. you can use excel to find range like `A2:A56` and `B2:B56`

#### Manual add student:
```
python studutil.py -a "[STUDENT NAME]" "[STUDENT NUMBER]"
```

### :running: Running application
Flask developers recommends ([here](https://flask.palletsprojects.com/en/2.2.x/quickstart/)) to do not use integrated server for production and it is just for development, they recommended to use WSGI, nginx, Apache or ... . but this app is designed for a class of students not for word-wide-web! and for simplicity I use flask server:
```batch
flask run --host=0.0.0.0 --port 80 --no-debugger
```

## Who or What is Kian?

While I am developing this software, protests continue in Iran and innocent people and children are being injured or murdered by the regime. The name Kian was chosen to commemorate the memory of Kian Pirfalak, the 9 years old child who was killed in Iran's protests by the regime forces.


## Why does this app uses an Access-point?

To prevent students from registering attendance of others and speeding up the process, we need a fixed and unique identifier. Nowadays most phones have a fixed and unique MAC address and it is accessible for the host when there is a direct connection.

As far as I know other ways like using cookies or browser storage are much more easier to get compromised. However, there are other ways to bypass this program. Nevertheless, MAC addresses can be changed (hard or very hard but not impossible). Students can bring their absent classmates' phones, or use their second device as their friend's device. But these make a fake presence status hard and expensive enough.

## License

This software is under GNU General Public License version 3 or (at your option) any later version. See LICENSE.

##### *Thanks to [@farooqkz](https://github.com/farooqkz) for reading and editing documents*
