## Hi To Hey (Client)
Hi To Hey is a realtime chat web application.  
This is the client of Hi To Hey.

## Running it
First, grap the dependenceis:

```
npm install
bower install
```

Second, make sure the server is running.  
By default, the server is running at `127.0.0.1:2016`.  
If your server is not running at it, you should change the config in two files.  
1. in `views/index.ejs`, change

  ``` html
  <script src="http://127.0.0.1:2016/socket.io/socket.io.js"></script>
  ```

  to

  ``` html
  <script src="http://[your server address]/socket.io/socket.io.js"></script>
  ```

2. in `public/js/index.js`, change

  ``` javascrip
  var serverBaseUrl = 'http://127.0.0.1:2016';
  ```

  to

  ``` javascrip
  var serverBaseUrl = 'http://[your server address]';
  ```

Then run the client like so:

```
node client.js
```

And the client is running at `http://127.0.0.1:4000`.  
Of course, it also can be changed in `clien.js`.

Now, you can visit the client at `http://127.0.0.1:4000`.  
Just chat for fun.

## Notice
To tun the client, make sure you have install [Node.js](https://nodejs.org/) and [bower](https://bower.io/).

## License
Copyright (C) 2016 semsevens.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
