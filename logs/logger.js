const fs = require('fs');
let globalstats = require("./stats.json");

function logger(type, interaction) {
	let statement = "";
	switch (type) {
		case "Info":
			statement = `${interaction.message}`
			console.log(`${getTime()} : ${globalstats.access_counter} : ${statement}`);
			append_to_file(
				"logs/access.txt",
				`${getTime()} : ${statement}\n`
			);
			return
		case "Create":
			statement = `Created new item with id: ${interaction.id}`;
			globalstats.Creates += 1;
			break;
		case "Read":
			statement = interaction.id ? `Retrieved item with id: ${interaction.id}`: `Retrieved all items`;
			globalstats.Reads += 1;
			break;
		case "Update":
			statement = `Updated item with id: ${interaction.id}`;
			globalstats.Updates += 1;
			break;
		case "Delete":
			statement = `Deleted item with id: ${interaction.id}`;
			globalstats.Deletes += 1;
			break;
		case "Error":
			statement = `Error: ${interaction.error}`;
			globalstats.errors_encountered += 1;
			break;
	}
	console.log(`${getTime()} : ${globalstats.access_counter} : ${statement}`);
	append_to_file(
		"logs/access.txt",
		`${getTime()} : ${globalstats.access_counter} : ${statement}\n`
	);
	globalstats.access_counter += 1;
	globalstats.last_used = getTime();
	updateStats()
}

function updateStats() {
	fs.writeFile("./logs/stats.json", JSON.stringify(globalstats), { encoding: 'utf8' }, function (err) {
		if (err) {
			return console.log(err);
		}
	});
}

function getTime() {
	var dateTime = new Date().toLocaleString('en-US', { timeZone: 'EST' });
	return dateTime;
}

async function append_to_file(filename, message) {
	var stream = fs.createWriteStream(filename, { flags: "a" });
	stream.write(message);
	stream.end();
}

module.exports = logger;