let NAME = require('../package.json').name;
let VERSION = require('../package.json').version;

const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('express-favicon');
const fs = require('fs');

const app = express();
app.use(favicon(__dirname + '/static/img/favicon.png'));
app.use('/static', express.static(__dirname + '/static'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Template Engine
app.engine('ntl', function (filePath, options, callback) { // define the template engine
    fs.readFile(filePath, function (err, content) {
        if (err) return callback(err)
        // this is an extremely simple template engine
        var rendered = content.toString();

        for (const [key, value] of Object.entries(options)) {
            if (key == "settings") continue;
            if (key == "_locals") continue;
            if (key == "cache") continue;

            var re = new RegExp("#" + key + "#", "g");
            rendered = rendered.replace(re, value);
        }

        return callback(null, rendered)
    })
})
app.set('views', __dirname + '/pages') // specify the views directory
app.set('view engine', 'ntl') // register the template engine

// Default Route
app.get('/', (req, res) => {
    res.render("replay", { title: "LetterBot's Replay"});
});

// Add 404
app.use((req, res, next) => {
    res.status(404).render("error", { title: "404", 'message' : `Page not found 🤔<br><span style="font-style: normal;">${req.method} ${req.path}</span>` });
});

app.listen(3000, () => { // Listen on port 3000
    console.log('Listening!') // Log when listen success
})

