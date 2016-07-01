## Hi To Hey
Hi To Hey is a realtime chat web application.  

## Features
1. realtime chat
2. multi-rooms switch
 * When someone leave a room，system will notify everyone else in this room.
 * When someone join a room，system will notify everyone else in this room.
3. query current room status (instruct mode)
 * Send message(instruct) like `$count`, system wil show the number of online people in this room.
 * Send message(instruct) like `$whos`, system wil show all online people in this room.
4. calculate math expression (caculate mode)
 * Send message like `#[expression]`, system will tell you the result of it(so intimate).
   For expample, if you send `# 1 + 2 * ( 4 - 1)`, system will tell you `7`;
5. sensitive information notification
 * If someone else is trying to log in with your account when you are online,
   system will notify you and tell you the ip address of that guy.
6. scroll reflesh
 * Because the messages of a room can be much, taking into account the efficiency,
   when you join a room first time, it will show only 10 messages by default.
   Of course, you can scroll to the top and it will load 10 more history messages if exiting.
7. other
 * To be continued.

## Installation
Just go to `client` and `server` folders for more details.

## Demo
Visit [Hi To Hey](http://semsevens.com:9797) for a overview.

## License
Copyright (C) 2016 semsevens.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
