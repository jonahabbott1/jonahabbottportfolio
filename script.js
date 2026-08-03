(function () {
	var output = document.getElementById('boot-output');
	if (!output) return;

	var host = 'admin@myportfolio';
	var cwd = '~';
	var bio = "I'm passionate about understanding emerging cyber threats and developing the technical skills to defend against them. My experience includes Windows system administration, vulnerability mitigation, and local network configuration. I also love anything with wheels and enjoy playing racquetball!";

	var lines = [
		{ type: 'cmd', text: 'whoami' },
		{ type: 'out', text: 'Jonah Abbott' },
		{ type: 'cmd', text: 'cd portfolio', cwdAfter: '~/portfolio' },
		{ type: 'cmd', text: 'cat education.txt' },
		{ type: 'out', text: 'Bachelor of Science in Cybersecurity, Brigham Young University' },
		{ type: 'cmd', text: 'cat about.txt' },
		{ type: 'out', text: bio },
		{ type: 'cmd', text: 'open profile.jpg' },
		{ type: 'image', src: 'images/profile-avatar.jpg', alt: 'Jonah Abbott' }
	];

	function makePrompt(cwdVal) {
		var span = document.createElement('span');
		span.className = 'boot-prompt';
		span.textContent = host + ':' + cwdVal + '$ ';
		return span;
	}

	function makeImage(line) {
		var img = document.createElement('img');
		img.src = line.src;
		img.alt = line.alt;
		img.width = 160;
		img.height = 160;
		return img;
	}

	function renderInstant() {
		var runningCwd = '~';
		lines.forEach(function (line) {
			if (line.type === 'cmd') {
				output.appendChild(makePrompt(runningCwd));
				output.appendChild(document.createTextNode(line.text + '\n'));
				if (line.cwdAfter) runningCwd = line.cwdAfter;
			} else if (line.type === 'out') {
				output.appendChild(document.createTextNode(line.text + '\n'));
			} else if (line.type === 'image') {
				output.appendChild(makeImage(line));
				output.appendChild(document.createTextNode('\n'));
			}
		});
		output.appendChild(makePrompt(runningCwd));
		var cursor = document.createElement('span');
		cursor.className = 'boot-cursor';
		output.appendChild(cursor);
	}

	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduceMotion) {
		renderInstant();
		return;
	}

	var skipped = false;
	function skipToEnd() {
		if (skipped) return;
		skipped = true;
		output.textContent = '';
		renderInstant();
	}
	document.getElementById('main').addEventListener('click', skipToEnd);
	document.addEventListener('keydown', skipToEnd);

	// Cursor stays in the DOM the whole time; new content is inserted just before it,
	// so it always sits at the current write position (visible while typing, not just at the end).
	var cursor = document.createElement('span');
	cursor.className = 'boot-cursor';
	output.appendChild(cursor);

	function insertBeforeCursor(node) {
		output.insertBefore(node, cursor);
	}

	var lineIndex = 0;
	var charIndex = 0;

	function nextLine() {
		if (skipped) return;
		if (lineIndex >= lines.length) {
			insertBeforeCursor(makePrompt(cwd));
			return;
		}

		var line = lines[lineIndex];

		if (line.type === 'out') {
			insertBeforeCursor(document.createTextNode(line.text + '\n'));
			lineIndex++;
			setTimeout(nextLine, 500);
			return;
		}

		if (line.type === 'image') {
			insertBeforeCursor(makeImage(line));
			insertBeforeCursor(document.createTextNode('\n'));
			lineIndex++;
			setTimeout(nextLine, 500);
			return;
		}

		typeCmdChar(line);
	}

	function typeCmdChar(line) {
		if (skipped) return;
		if (charIndex === 0) {
			insertBeforeCursor(makePrompt(cwd));
		}

		if (charIndex < line.text.length) {
			insertBeforeCursor(document.createTextNode(line.text[charIndex]));
			charIndex++;
			setTimeout(function () { typeCmdChar(line); }, 22 + Math.random() * 30);
		} else {
			insertBeforeCursor(document.createTextNode('\n'));
			if (line.cwdAfter) cwd = line.cwdAfter;
			lineIndex++;
			charIndex = 0;

			var next = lines[lineIndex];
			var nextIsOutput = next && (next.type === 'out' || next.type === 'image');
			if (nextIsOutput) {
				nextLine(); // output prints instantly right after the command finishes typing
			} else {
				setTimeout(nextLine, 300); // small pause before the next command starts typing
			}
		}
	}

	nextLine();
})();
