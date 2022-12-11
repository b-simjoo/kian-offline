In the name of God of the rainbow

> **Warning**
> This repository is under development. The `main` branch contains first alpha version and may be unstable. Developing v1 at [`develop-v1`](https://github.com/bsimjoo-official/kian/tree/develop-v1) branch.
# Kian
[![](https://img.shields.io/github/v/release/bsimjoo-official/kian?include_prereleases&label=latest%20pre-release)](https://github.com/bsimjoo-official/kian/releases)
[![](https://img.shields.io/badge/dev--branch-develop--v1-blue)](https://github.com/bsimjoo-official/kian/tree/develop-v1)

Kian is a simple Persian Windows app for teachers to easily roll call students. This app will create an Access-point and uses Flask as HTTP backend.
Students should connect to the access point and enter server IP address in the browser, then for the first time they must submit their student number, application will save their MAC address and the student code for future. Teachers can use a Excel file which contains students code and their name. This app will edit the file and add new columns for each session and write about students' presence.

## Who or What is Kian?

While I am developing this software, protests continue in Iran and innocent people and children are being injured or murdered by the regime. The name Kian was chosen to commemorate the memory of Kian Pirfalak, the 9 years old child who was killed in Iran's protests by the regime forces.


## Why does this app create an Access-point?

To prevent students from registering attendance of others and speeding up the process, we need a fixed and unique identifier. Nowadays most phones have a fixed and unique MAC address and it is accessible for the host when there is a direct connection.

As far as I know other ways like using cookies or browser storage are much more easier to get compromised. However, there are other ways to bypass this program. Nevertheless, MAC addresses can be changed (hard or very hard but not impossible). Students can bring their absent classmates' phones, or use their second device as their friend's device. But these make a fake presence status hard and expensive enough.

## License

This software is under GNU General Public License version 3 or (at your option) any later version. See LICENSE.
