# KIAN API Description v1
For each request there are **parameters**, **successful responses** and **error responses**

> **Warning**
> All api endpoints begins with `/api/v1`. e.g `/api/v1/register`

> **Note**
> The `info` in error responses is useful for easier debugging and also have `EASTER_EGG` for my students! (shall I remove it?). It is recommended not to use it.

## Students registration and attendance

<details>

<summary><h3><code>GET</code> <code>/register</code> <i>(register a student number)</i><h3></summary>
Server will save student code and mac address in database.

### Parameters
|name   |type    |data type|description   |
|-------|--------|---------|--------------|
|`std_num`|required|`string`   |student number|

### Successful response
> HTTP status code: 200
>
> content-type: `application/json`

|property|type|description|
|--------|----|-----------|
|`student_name`|`string`|Student name|

### Error responses

|http code|description|
|---------|-----------|
|404      |student not found|
|400      |`std_num` didn't sent|
|403      |Already registered; user can not register multiple times (see [why?](https://github.com/bsimjoo-official/kian#why-does-this-app-create-an-access-point))|
</details>

<details>
<summary><h3><code>GET</code> <code>/attendance</code> <i>(register a student presence)</i><h3></summary>

### Parameters
> None

### Successful responses
> HTTP status code: 200 / 203 (if user presence is already registered)
>
> content-type: `application/json`

|property|type|description|
|--------|----|-----------|
|`name`  |`string`|Student name|
|`number`|`string`|Student number|
|`current_meeting`|`int`|Current session (or meeting) that presence registered|
|`attendances`|`list[dict]`|List of student attendances|
|`meetings`|`list[dict]`|List of all meetings that were held|
|`info`|`sting`|This property only exists when student presence is already registered|

##### Attendances properties

|property|type|description|
|--------|----|-----------|
|`id`    |`int`|Id of the `Attendance` object|
|`device`|`int`|Id of The device that student was used to register his presence|
|`student`|`int`|Id of the `Student` object|
|`time`   |`string`|the time of attendance. format: `HH:MM:SS.mmmmmm`|

##### Meetings properties
> **Note**
> `meetings` property contains all meetings that started by admin. Student may was absent in some of them. it is useful to create a full table of all 
> meetings that were held and status of student attendance

|property|type|description|
|--------|----|-----------|
|`id`    |`int`|Id of `Meeting` object|
|`date`  |`string`|Date of meeting. format:`yyyy-mm-dd`|

### Error responses

|http code|description|
|---------|-----------|
|403      |student is not registered|
|404      |the meeting did not started yet.|
</details>

<details>
<summary><h3>Student Object</h3></summary>

the `student object` differs based on request.

#### Attendance request
|property |type |description |
|---------|-----|------------|
|`name`   |`string`| student's name|
|`number` |`string`| student's number|
|`attendances`|[`array[attendance object]`]()| a list of attendances for meetings which this student was present.|
|`meetings`|[`array[meeting object]`]()| a list of all meetings|
</details>

<details>
<summary><h3>Attendance Object</h3></summary>

the `Attendance Object` differs based on request.

#### Attendance Object
|property |type |description |
|---------|-----|------------|
|`id`     |int  |`attendance object` id|
|`student`|int  |`student object` id|
|`device` |int  |`device object` id|
|`meeting`|int  |`meeting object` id|
|`time`   |string

</details>