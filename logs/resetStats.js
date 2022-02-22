const fs = require('fs');

let globalstats = {
    "access_counter": 0,
    "DMs": 0,
    "CMDs": 0,
    "last_used": null,
    "errors_encountered": 0,
    "rate_limits": 0
}

function updateStats() {
    fs.writeFile("./logs/stats.json", JSON.stringify(globalstats), { encoding: 'utf8' }, function (err) {
        if (err) {
            return console.log(err);
        }
    });
    fs.writeFile("./logs/access.txt", "", { encoding: 'utf8' }, function (err) {
        if (err) {
            return console.log(err);
        }
    });
    fs.writeFile("./logs/error.txt", "", { encoding: 'utf8' }, function (err) {
        if (err) {
            return console.log(err);
        }
    });
}

updateStats();