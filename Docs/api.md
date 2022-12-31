# KIAN API v1 Description 
For each request there are **parameters**, **successful response(s)** and **error response(s)**

> **Warning**
> All api endpoints begins with `/api/v1`. e.g `/api/v1/register`

> **Note**
> The `info` in error responses is useful for easier debugging and also it have `EASTER_EGG` for my students! (shall I remove it?). It is recommended not to use it.

> **Warning**
> Endpoints with <sup>[login required]</sup> tag will redirect user to `/admin` if user didn't logged in.

> **Note**
> Students only can get objects that are related to their-self (like [`Attendance` object](#attendance-object), [`Device` object](#device-object)).
> But they can't get any `Meeting` object from `/meetings/*` or `/current_meeting`. Admin has access to all objects

<details>

<summary><h3>:green_circle: <code>GET</code> <code>/register</code> <i>(register a student number)</i><h3></summary>

Server will save student code and mac address in database.

#### Parameters
|name   |type    |data type|description   |
|-------|--------|---------|--------------|
|std_num|required|`string` |student number|

#### Successful response
> *HTTP status code: 200*
>
> *content-type: `application/json`*

|property    |type    |description |
|------------|--------|------------|
|student_name|`string`|Student name|

#### Error responses
> *content-type: `application/json`*

|http code|description|
|---------|-----------|
|404      |student not found|
|400      |`std_num` didn't sent|
|403      |Already registered; user can not register multiple times (see [why?](https://github.com/bsimjoo-official/kian#why-does-this-app-uses-an-access-point))|

<hr>
</details>

<details>
<summary><h3>:green_circle: <code>GET</code> <code>/whoami</code> <i>(if user is registered get name and number)</i></summary>

it is recommended to use this endpoint to check if student is logged in or not. then show login for or send attendance request.

#### Parameters
> None

#### Successful responses
> *HTTP status code: 200*
>
> *content-type: `application/json`*

|property|type|description|
|--------|----|-----------|
|name    |`string`|Student name|
|number  |`string`|Student number|

#### Error responses
> *content-type: `application/json`*

|http code|description|
|---------|-----------|
|400      |student is not registered|

<hr>
</details>

<details>
<summary><h3>:green_circle: <code>GET</code> <code>/attendance</code> <i>(register a student presence and return student data)</i><h3></summary>

This endpoint register student's present and returns all data that is needed to render a table for student.

#### Parameters
> None

#### Successful responses
> *HTTP status code: 200 / 203 (if user presence is already registered)*
>
> *content-type: `application/json`*

|name   |type    |data type|description   |
|-------|--------|---------|--------------|
|std_num|required|`string` |student number|

#### Error responses
> *content-type: `application/json`*

|http code|description|
|---------|-----------|
|403      |student is not registered|
|404      |the meeting did not started yet.|
  
<hr>
</details>

<details>
<summary><h3>:green_circle: <code>GET</code> <code>/can_login</code> <i>(check ability for logging in as admin)</i></summary>

This endpoint will check that the client is able to try to login as admin or not. teacher can config server to
only allow client from localhost for login. Also client may use this endpoint to check that client is banned or not.

#### Parameters
> None

#### Successful responses
> *HTTP status code: 200 / 203 (if user presence is already registered)*
>
> *content-type: `application/json`*

|name   |type     |value   |
|-------|---------|--------------|
|can_login|`bool` |`true`|
|banned   |`bool` |`false`|

#### Error response
> *content-type: `application/json`*

|http code|description|
|---------|-----------|
|403      |if `banned=true` the client is banned. if `can_login=false` not local users can not login|
  
<hr>
</details>

<details>
<summary><h3>:orange_circle: <code>POST</code> <code>/login</code> <i>(Login teacher to admin panel)</i></summary>

#### Request
> *content-type: `application/json`*

|name    |type    |data type|description                                             |
|--------|--------|---------|--------------------------------------------------------|
|username|required|`string` |admin username `default admin username: "kian pirfalak"`|
|password|required|`string` |admin password `default admin password: "admin"`        |

#### Successful response
> *HTTP status code: 200*
>
> *content-type: `application/json`*

> Empty

#### Error responses
> *content-type: `application/json`*

|name      |type  |description        |
|----------|------|-------------------|
|tries_left|`int` |count of tries left|

|http code|description|
|---------|-----------|
|403      |Access denied you got banned|
|401      |Username and/or password are incorrect|
  
<hr>
</details>

<details>
<summary><h3>:green_circle: <code>GET</code> <code>/students</code> <i>(get all students info)<sup>[login required]</sup></i></summary>

This endpoint will return an `Array` of [`Student` object](#student-object).

#### Parameters
> None

#### Successful response
> *HTTP status code: 200 / 203 (if user presence is already registered)*
>
> *content-type: `application/json`*

> `array[[Student](#student-object)]`
  
<hr>
</details>

<details>
<summary><h3>:green_circle: <code>GET</code> <code>/students/&lt;student id&gt;</code> <i>(get a Student object with id)</i></summary>

This endpoint will return a [`Student` object](#student-object).

#### Parameters
> None

#### Successful response
> *HTTP status code: 200 / 203 (if user presence is already registered)*
>
> *content-type: `application/json`*

> [`Student` object](#student-object)

#### Error responses
> *content-type: `application/json`*

|http code|description|
|---------|-----------|
|401      |Access denied|
|404      |Student not found|
  
<hr>
</details>

<details>
<summary><h3>:green_circle: <code>GET</code> <code>/attendances</code> <i>(get all Attendances)<sup>[login required]</sup></i></summary>

This endpoint will return an Array of [`Attendance` object](#attendance-object).

#### Parameters
> None

#### Successful response
> *HTTP status code: 200 / 203 (if user presence is already registered)*
>
> *content-type: `application/json`*

> `Array[[Attendance](#attendance-object)]`
  
<hr>
</details>

<details>
<summary><h3>:green_circle: <code>GET</code> <code>/attendances/&lt;attendance id&gt;</code> <i>(get an Attendance object with id)</i></summary>

This endpoint will return an [`Attendance` object](#attendance-object).

#### Parameters
> None

#### Successful response
> *HTTP status code: 200 / 203 (if user presence is already registered)*
>
> *content-type: `application/json`*

> [`Attendance` object](#attendance-object)

#### Error responses
> *content-type: `application/json`*

|http code|description|
|---------|-----------|
|401      |Access denied|
|404      |Attendance not found|
  
<hr>
</details>

<details>
<summary><h3>:green_circle: <code>GET</code> <code>/devices</code> <i>(get all Devices)<sup>[login required]</sup></i></summary>

This endpoint will return an Array of [`Device` object](#device-object).

#### Parameters
> None

#### Successful response
> *HTTP status code: 200 / 203 (if user presence is already registered)*
>
> *content-type: `application/json`*

> `Array[[Device](#device-object)]`
  
<hr>
</details>

<details>
<summary><h3>:green_circle: <code>GET</code> <code>/devices/&lt;device id&gt;</code> <i>(get a Device object with id)</i></summary>

This endpoint will return a [`Device` object](#device-object).

#### Parameters
> None

#### Successful response
> *HTTP status code: 200 / 203 (if user presence is already registered)*
>
> *content-type: `application/json`*

> [`Device` object](#device-object)

#### Error responses
> *content-type: `application/json`*

|http code|description|
|---------|-----------|
|401      |Access denied|
|404      |Device not found|
  
<hr>
</details>

<details>
<summary><h3>:green_circle: <code>GET</code> <code>/meetings</code> <i>(get all meetings)<sup>[login required]</sup></i></summary>

This endpoint will return an Array of [`Meeting` object](#meeting-object).

#### Parameters
> None

#### Successful response
> *HTTP status code: 200 / 203 (if user presence is already registered)*
>
> *content-type: `application/json`*

> `Array[[Meeting](#meeting-object)]`
  
<hr>
</details>

<details>
<summary><h3>:green_circle: <code>GET</code> <code>/meetings/&lt;meeting id&gt;</code> <i>(get a Meeting object with id)</i></summary>

This endpoint will return a [`Meeting` object](#meeting-object).

#### Parameters
> None

#### Successful response
> *HTTP status code: 200 / 203 (if user presence is already registered)*
>
> *content-type: `application/json`*

> [`Meeting` object](#meeting-object)

#### Error responses
> *content-type: `application/json`*

|http code|description|
|---------|-----------|
|404      |Meeting not found|
  
<hr>
</details>

<details>
<summary><h3>:green_circle: <code>GET</code> <code>/current_meeting</code> <i>(get current in progress meeting)<sup>[login required]</sup></i></summary>

This endpoint will return a [`Meeting` object](#meeting-object) if there is a meeting in progress.

#### Parameters
> None

#### Successful response
> *HTTP status code: 200 / 203 (if user presence is already registered)*
>
> *content-type: `application/json`*

> [`Meeting` object](#meeting-object)

#### Error responses
> *content-type: `application/json`*

|http code|description|
|---------|-----------|
|404      |No meeting is in progress|
  
<hr>
</details>

<details>
<summary><h3>:orange_circle: <code>POST</code> <code>/current_meeting</code> <i>(Start a new meeting)<sup>[login required]</sup></i></summary>

This endpoint will starts a new Meeting.

#### Request
> None

#### Successful response
> *HTTP status code: 200 or 202 if a meeting is in progress already*
>
> *content-type: `application/json`*

> [`Meeting` object](#meeting-object)

#### Error responses
> *content-type: `application/json`*

|http code|description|
|---------|-----------|
|500      |Unknown error while creating database record|
  
<hr>
</details>

<details>
<summary><h3>:red_circle: <code>DEL</code> <code>/current_meeting</code> <i>(end current in progress meeting)<sup>[login required]</sup></i></summary>

This endpoint will return a [`Meeting` object](#meeting-object) if there was a meeting in progress.

#### Parameters
> None

#### Successful response
> *HTTP status code: 200*
>
> *content-type: `application/json`*

> [`Meeting` object](#meeting-object)

#### Error responses
> *content-type: `application/json`*

|http code|description|
|---------|-----------|
|404      |No meeting is in progress|
|500      |Unknown error while saving database record|
  
<hr>
</details>

<details>
<summary><h3>:orange_circle: <code>POST</code> <code>/score</code> <i>(add a new score for a student)<sup>[login required]</sup></i></summary>

#### Request
> *content-type: `application/json`*
|property |type |data type|description |
|---------|-----|---------|------------|
|id       |not required|`int` >0 or `null`|Id of existing Score object to edit|
|student  |required    |`int` >0        |Id of a Student|
|meeting  |not required|`int` >0 or `null`|Id of a [`Meeting` object](#meeting-object)|
|score    |required    |`float`|score|
|full_score|not required|`float`|full score|
|reason    |not required|`string`|Description or the reason of score|

#### Successful response
> *HTTP status code: 200 or 202 if a meeting is in progress already*
>
> *content-type: `application/json`*

> `Score` object

#### Error responses
> *content-type: `application/json`*

|http code|description|
|---------|-----------|
|500      |Unknown error while creating database record|
  
<hr>
</details>

## Objects

### `Student` object
|property |type |description |
|---------|-----|------------|
|id|`int`|Student object id|
|name   |`string`|Student's name|
|number |`string`|Student's number|
|attendances|`array[Attendance]`|A list of attendances for meetings which this student was present.|
|scores|`array[Score]`|List of score that given to student|
|devices|`array[Device]`|List of student's devices|
|total_score|`float`|Student's total score|
|total_full_score|`float`|Student's total full score|

### `Meeting` object

|property|type|description|
|--------|----|-----------|
|id    |`int`|Id of the `Meeting` object|
|date  |`string(Date)`|Date of meeting. format: `YYYY-MM-DD`|
|start_at|`string(Time)`|Time of starting the meeting. format: `HH:MM:SS.ssssss`|
|end_at|`string(Time)`|Time of ending the meeting. format: `HH:MM:SS.ssssss`|
|in_progress|`bool`|Meeting is in progress or not|
|count_of_attendances|`int`|Count of attendances in this meeting|
|attendances|`Array[Attendance]`|An array of all Attendances for this meeting|
|scores|`Array[Score]`|An array of all scores that given to students in this meeting|
### `Attendance` object

|property|type|description|
|--------|----|-----------|
|id    |`int`|Id of the `Attendance` object|
|device|`int`|Id of The device that student was used to register his presence|
|meeting|`int`|Id of `meeting` object|
|time   |`string(Time)`|The time of attendance. format: `HH:MM:SS.ssssss`|

### `Device` object

|property|type|description|
|--------|----|-----------|
|id    |`int`|Id of the `Device` object|
|mac|`string`|Device mac address|
|blocked|`bool`|Device is blocked or not. (not used)|
|student|`id`  |Id of student that owns this device|
|registration_time   |`string(DateTime)`|the time of attendance. format: `YYYY-MM-DDTHH:mm:SS.ssssss`|

### `Score` object

|property|type|description|
|--------|----|-----------|
|id    |`int`|Id of the `Score` object|
|meeting|`int`or`null`|Id of `meeting` object. The score can be unrelated to all sessions, but this is will not happen in v1|
|student|`int`|Id of the `Student` object|
|score   |`float`|score that given by teacher|
|full_score|`float`or`null`|Full score witch specified by teacher|
