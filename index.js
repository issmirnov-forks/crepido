// Load node modules.
var fs = require("fs");
var path = require("path");
var marked = require("marked");
var express = require("express");
var app = express();

var cache = [];
var serveTypes = [".css", ".js", ".png", ".jpeg", ".jpg"];

// Parse command line arguments
var args = process.argv.slice(2);
var index = args.indexOf("-h");
if (index !== -1) {
    console.log("Kanbana help:");
    console.log("Start the program with");
    console.log("\tnode index.js [parameters]");
    console.log("\nParameters:");
    console.log("\t-c time        Time (in minutes) between cache flushes");
    console.log("\t-p port        Server port");
    process.exit();
}
index = args.indexOf("-p");
var port = Math.abs(parseInt(args[index + 1])) || process.env.PORT || 3000;
index = args.indexOf("-c");
var maxTime = Math.abs(parseInt(args[index + 1])) || process.env.CACHE || 10;

// Checks if path is in cache
function isCached(path) {
    for (var i = 0; i < cache.length; i++) {
        if (cache[i].path === path) {
            return { response: true, index: i };
        }
    }
    return { response: false, index: -1 };
}

// Cleans the cache
function gc() {
    var now = new Date();
    for (var i = 0; i < cache.length; i++) {
        if (now - cache[i].time >= maxTime * 60 * 1000) {
            console.log("gc(): Flushing " + cache[i].path);
            cache.splice(i, 1);
        }
    }
}

// Render HTML from markdown
function renderHTML(data) {
    var boards = [];
    var heads = data.match(/(---)\n.+\n.+\n(---)/g);
    for (var i = 0; i < heads.length; i++) {
        boards[i] = {
            head: JSON.parse("{" + heads[i].replace(/(---)/g, "") + "}"),
            body: marked(data.substring(data.indexOf(heads[i]), heads[i + 1] !== undefined ? data.indexOf(heads[i + 1]) : data.length).replace(heads[i], "")),
        };
    }
    return boards;
}

// Custom renderer for Marked.
var markedRenderer = new marked.Renderer();

// Heading callback for renderer.
markedRenderer.heading = function (text, level) {
    var prefix = "<h2>";

    var cssClasses = ["board__card"];

    // Add collapsible helpers.
    if (text.match("\\[(\\-)\\]", "gi")) {
        cssClasses.push("board__card--collapsible");
        text = text.replace(/\[\-\]\s?/gi, "");
    }

    // Add a custom board name.
    var name = text.toLowerCase().replace(/[^\w]+/g, "-");
    cssClasses.push("board__card--" + name);

    prefix = '<div class="' + cssClasses.join(" ") + '">' + prefix;

    return prefix + text + "</h2>";
};

// List callback for renderer.
markedRenderer.list = function (body, ordered) {
    var type = ordered ? "ol" : "ul";

    // Add Checkboxes
    body = addCheckboxes(body);

    // Create timers
    body = addTimersDays(body);
    body = addTimersHours(body);
    body = addTimersMinutes(body);

    // Create labels.
    body = labelize(body);

    // Add a suffix. See markedRenderer.heading.
    var suffix = "</div>";

    return "<" + type + ">\n" + body + "</" + type + ">" + suffix + "\n";
};

// Set marked options
marked.setOptions({
    renderer: markedRenderer,
    pedantic: false,
    gfm: true,
    tables: false,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false,
});

// GET request for boards
app.get("/board*", function (request, response) {
    gc();
    var reqpath = __dirname + request.path + (request.path.indexOf(".md") === -1 ? ".md" : "");
    reqpath = reqpath.replace("/board", "/boards");
    var cached = isCached(reqpath);
    if (cached.response) {
        console.log("get(): serving cached " + request.path + " to " + request.ip);
        response.type(".html");
        response.status(200).send(cache[cached.index].html);
        return;
    }
    fs.readFile(reqpath, "utf8", function (err, data) {
        if (err) {
            console.log("get(): " + request.path + " does not exist (" + request.ip + ")");
            var notfound =
                '<html><head><title>Kanbana</title><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css"><link rel="stylesheet" href="/assets/stylesheets/style.css"><link rel="stylesheet" href="/assets/stylesheets/labels.css"></head><body><div class="content"><div class="board"><div class="board__header"><h1>404</h1><h3 class="board__name">The requested board was not found.</h3></div></div></div></body></html>';
            response.type(".html");
            response.status(404).send(notfound);
            return;
        }
        console.log("get(): serving " + request.path + " to " + request.ip);
        var rendered = renderHTML(data);
        var html = "";
        var title = [];
        for (var i = 0; i < rendered.length; i++) {
            title.push(rendered[i].head.name);
            var picture = "";
            if (rendered[i].head.picture != "none") {
                picture = '<a href="' + rendered[i].head.picture + '" class="board__picture"><img src="' + rendered[i].head.picture + '"></a>';
            } else {
                picture = '<div class="board__picture"></div>';
            }

            html +=
                '<div class="board"><div class="board__header">' +
                picture +
                '<h1 class="board__name">' +
                rendered[i].head.name +
                "</h1></div>" +
                rendered[i].body +
                "</div>";
        }
        html =
            "<html><head><title>" +
            title.join(" | ") +
            '</title><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css"><link rel="stylesheet" href="/assets/stylesheets/style.css"><link rel="stylesheet" href="/assets/stylesheets/labels.css"></head><body><div class="content">' +
            html +
            "</div></body></html>";

        cache.push({ path: reqpath, html: html, time: new Date() });
        response.type(".html");
        response.status(200).send(html);
    });
});

// General GET request
app.get("/*", function (request, response) {
    gc();
    for (let i = 0; i < serveTypes.length; i++) {
        const type = serveTypes[i];
        if (request.path.indexOf(type) !== -1 || request.path.indexOf(type.toUpperCase()) !== -1) {
            response.status(200).sendFile(__dirname + request.path);
            return;
        }
    }

    var cached = isCached(request.path);
    if (cached.response) {
        console.log("get(): serving cached main menu to " + request.ip);
        response.type(".html");
        response.status(200).send(cache[cached.index].html);
        return;
    }
    if (request.path === "/") {
        var html =
            '<div class="board"><div class="board__header"><h2 class="board__name">All boards</h2></div><div class="board__card board__card--headers"><h1>Boards</h1><ul>';
        var files = fs.readdirSync("./boards");
        files.forEach((file) => {
            file = file.replace(".md", "");
            if (file.indexOf(".") !== 0) {
                html += '<li><a href="/board/' + file + '">' + file.charAt(0).toUpperCase() + file.slice(1) + "</a></li>";
            }
        });
        html =
            '<html><head><title>Boards</title><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css"><link rel="stylesheet" href="/assets/stylesheets/style.css"><link rel="stylesheet" href="/assets/stylesheets/labels.css"></head><body><div class="content">' +
            html +
            "</ul></div></div></div></body></html>";
        console.log("get(): serving main menu to " + request.ip);
        cache.push({ path: request.path, html: html, time: new Date() });
        response.status(200).send(html);
    }
    response.status(404).send();
});

// Convert [ ] and [x] to checkboxes.
function addCheckboxes(string) {
    return string.replace(new RegExp("\\[([\\s|x])\\]", "gi"), function ($0, $1) {
        var value = $1 == "x" ? 1 : 0;
        return (
            '<input class="status hidden ' +
            (value === 1 ? "done" : "") +
            '" type="checkbox" value="' +
            value +
            '" ' +
            (value === 1 ? "checked" : "") +
            " disabled/>"
        );
    });
}

// Converts [1h], [7h] to timers.
function addTimersDays(string) {
    return string.replace(new RegExp("\\[([0-9]{1,}(.[0-9])?)[d]\\]", "gi"), function ($0, $1) {
        return '<span class="timer" data-value="' + $1 + '"><i class="fa fa-clock-o"></i>' + $1 + "d</span>";
    });
}
function addTimersHours(string) {
    return string.replace(new RegExp("\\[([0-9]{1,}(.[0-9])?)[h]\\]", "gi"), function ($0, $1) {
        return '<span class="timer" data-value="' + $1 + '"><i class="fa fa-clock-o"></i>' + $1 + "h</span>";
    });
}
function addTimersMinutes(string) {
    return string.replace(new RegExp("\\[([0-9]{1,}(.[0-9])?)[m]\\]", "gi"), function ($0, $1) {
        return '<span class="timer" data-value="' + $1 + '"><i class="fa fa-clock-o"></i>' + $1 + "m</span>";
    });
}

// Converts [string] to <span class="label">string</span>.
function labelize(string) {
    return string.replace(new RegExp("\\[([^\\]]*)\\]", "gi"), function ($0, $1) {
        var name = $1.toLowerCase().replace(/[^\w]+/g, "-");
        return (
            '<span class="project label label--' + name + '" data-name="' + name + '" data-project="' + $1 + '"><i class="fa fa-folder-o"></i>' + $1 + "</span>"
        );
    });
}

app.listen(port);
console.log("Starting server http://localhost:" + port + "\nCache time: " + maxTime + " min" + "\nSee node index.js -h for help\n");
