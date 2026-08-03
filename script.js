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

	function appendFinalCursor(cwdVal) {
		var cursor = document.createElement('span');
		cursor.className = 'boot-cursor';
		output.appendChild(makePrompt(cwdVal));
		output.appendChild(cursor);
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
			}
		});
		appendFinalCursor(runningCwd);
	}

	var alreadyPlayed = sessionStorage.getItem('bootPlayed');
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (alreadyPlayed || reduceMotion) {
		renderInstant();
		sessionStorage.setItem('bootPlayed', '1');
		return;
	}

	var skipped = false;
	function skipToEnd() {
		if (skipped) return;
		skipped = true;
		output.textContent = '';
		renderInstant();
		sessionStorage.setItem('bootPlayed', '1');
	}
	document.getElementById('main').addEventListener('click', skipToEnd);
	document.addEventListener('keydown', skipToEnd);

	var lineIndex = 0;
	var charIndex = 0;

	function nextLine() {
		if (skipped) return;
		if (lineIndex >= lines.length) {
			appendFinalCursor(cwd);
			sessionStorage.setItem('bootPlayed', '1');
			return;
		}

		var line = lines[lineIndex];

		if (line.type === 'out') {
			output.appendChild(document.createTextNode(line.text + '\n'));
			lineIndex++;
			setTimeout(nextLine, 400);
			return;
		}

		if (line.type === 'image') {
			output.appendChild(makeImage(line));
			lineIndex++;
			setTimeout(nextLine, 400);
			return;
		}

		typeCmdChar(line);
	}

	function typeCmdChar(line) {
		if (skipped) return;
		if (charIndex === 0) {
			output.appendChild(makePrompt(cwd));
		}

		if (charIndex < line.text.length) {
			output.appendChild(document.createTextNode(line.text[charIndex]));
			charIndex++;
			setTimeout(function () { typeCmdChar(line); }, 22 + Math.random() * 30);
		} else {
			output.appendChild(document.createTextNode('\n'));
			if (line.cwdAfter) cwd = line.cwdAfter;
			lineIndex++;
			charIndex = 0;
			setTimeout(nextLine, 350);
		}
	}

	nextLine();
})();
