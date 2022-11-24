In the name of God of the rainbow
# Kian
First of all and before I describe my app I should say while I am developing this software, protests continue in Iran and innocent people and children are being injured or murdered by the government. The name Kian was chosen to commemorate the memory of Kian Pirfalak, the 9 years old child who was killed in Iran's protests.

# Description
Kian is a Persian simple windows app for teachers to easily roll call students. This app will create an Access-point and uses flask as HTTP backend.
Students should connect to the access point and enter server ip address in the browser, then for the first time they should submit their student number, application will save their mac address and the student code for future. Teachers can use a Excel file contains students number and their name, this app will edit the file and add new columns for each day and write students presence.

# Why this app create an Access-point?
To prevent students from registering attendance instead of others and speed up the precess for next times, we need a fixed and unique identifier. nowadays A lot of phones have a fixed and unique MAC address and it is accessible when there is a direct connection.

as far as I know other ways like using cookies and ... are much more easier to break. However, there are other ways to bypass this program. MAC addresses can be changed (hard but possible), students can bring their absent classmates' phones, or use their second device as their friend's device, but I don't think these are important.
