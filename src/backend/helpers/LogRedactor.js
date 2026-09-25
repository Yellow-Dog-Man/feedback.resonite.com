// Vendored from https://github.com/XDelta/LogRedactor/blob/main/logRedactor.js
// Commit: https://github.com/XDelta/LogRedactor/commit/f8027848620fb69ea00fdc76843c0be3076003e9
// License: MIT (see LICENSE at that repo)

const redactionString = "<Redacted>";

//
function locateUsersInfo(lines) {
	const allNames = new Set();
	
	const patterns = [
		//Catches usernames as well as some user/machine ids
		/User (?:Joined|Left).*Username:\s*([^,]*),\s*UserID:\s([^,]*),.*?MachineID:\s*(\S+)/i,

		//Local User SteamID: 76561198044632081
		/Local User SteamID:\s(\d+)/i,

		//Any U-Name or M-hash name
		/\b([UM]-[A-Za-z0-9-]+)\b/i,

		//Capture usernames from User Exmaple Role:
		/User ([^,]+) Role:/i
	];
	for (const line of lines) {
		for (const pattern of patterns) {
			const match = line.match(pattern);

			if (!match) {
				continue;
			}

			for (const value of match.slice(1)) {
				if (value) {
					allNames.add(value);
				}
			}
		}
	}

	//Sort names by longest replacements first
	const allNamesSorted = [...allNames].sort((a, b) => b.length - a.length);

	return allNamesSorted;
}

function redactPaths(lines) {
	const patterns = [
		// Most normal paths on Windows R:\Program Files\Steam\steamapps\common\Resonite
		/[A-Z]:[\\/](?:.*?)(?=[\\/]Resonite(?=[\\/]|$))/i,

		// Windows UNC paths like \\Carthage\Shared\Resonite
		/\\\\[^\\/]+[\\/](?:.*?)(?=[\\/]Resonite(?=[\\/]|$))/i,

		//TODO need more logs from linux/headlesses
	];

	for (let i = 0; i < lines.length; i++) {
		for (const pattern of patterns) {
			lines[i] = lines[i].replace(
				pattern,
				redactionString
			);
		}
	}
	return lines;
}

function redactNames(lines, allNames) {

	return lines.map(line => {

		for (const name of allNames) {
			//Skip empty
			if (!name) {
				continue;
			}

			const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			const pattern = new RegExp(escaped, "g");

			line = line.replace(pattern, () => {
				return redactionString;
			});
		}

		return line;
	});
}

export function processLog(text) {
	let lines = text.split(/\r?\n/);

	const allNames = locateUsersInfo(lines);

	lines = redactPaths(lines);
	lines = redactNames(lines, allNames);

	return {
		text: lines.join("\n"),
		names: [...allNames]
	};
}

