# Crepido
Create (kanban) boards to track users and projects from flat Markdown files.

![Screenshot](https://raw.githubusercontent.com/SrGMC/crepido/master/screenshot.png)

## Setup

1. `$ git clone https://github.com/SrGMC/crepido.git`.
2. `$ cd crepido && npm install`.
3. `$ npm run`.

*A server will start al port 3000*

## How to create boards

1. Create a file in the *./boards* directory.
2. Add your text as follows.

```
---
"name": "Crepido",
"picture": "http://alvaro.ga/images/header.png"
---

# Headers
* [UI] Labels
* [1h] Timers
* [25m] [UI] Labels and timers
* [ ] Uncompleted task
* [x] Completed task

# Markdown
* **Bold**
* *Italic*
* `code`
```

3. Acess your boards a `http://<server ip>:3000/<board name>` or `http://<server ip>:3000/<board name>.md`
  
Note:
1. Each heading followed by a list will be converted to a card.
2. `[Title] [labels]` are converted to labels.
3. `[3h]` is converted to timers.
4. `[ ]`, `[x]` are used to show tasks.

## How to customize colors

To add custom colors for boards and labels, edit `./assets/styles.css`.

## TODO
* [x] Command line arguments for cache time
* [x] Start page with all existing boards
* [x] 404 page

License
--------------

The MIT License (MIT)

Copyright (c) 2017 Álvaro Galisteo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

