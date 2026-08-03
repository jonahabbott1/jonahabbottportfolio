(function () {
	var overlay = document.getElementById('boot-sequence');
	var output = document.getElementById('boot-output');
	if (!overlay || !output) return;

	if (sessionStorage.getItem('bootPlayed')) {
		overlay.remove();
		return;
	}

	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	var host = 'jonah@byu';
	var cwd = '~';
	var lines = [
		{ type: 'cmd', text: 'whoami' },
		{ type: 'out', text: 'jonah_abbott' },
		{ type: 'cmd', text: 'cd portfolio', cwdAfter: '~/portfolio' },
		{ type: 'cmd', text: 'cat about.txt' },
		{ type: 'out', text: 'Cybersecurity student @ BYU.' },
		{ type: 'out', text: 'Building secure systems. Breaking insecure ones (with permission).' }
	];

	var skipped = false;
	function finish() {
		if (skipped) return;
		skipped = true;
		sessionStorage.setItem('bootPlayed', '1');
		overlay.classList.add('boot-hidden');
		overlay.addEventListener('transitionend', function () { overlay.remove(); }, { once: true });
	}

	overlay.addEventListener('click', finish);
	document.addEventListener('keydown', finish);

	if (reduceMotion) {
		var full = '';
		lines.forEach(function (line) {
			if (line.type === 'cmd') full += host + ':' + cwd + '$ ' + line.text + '\n';
			else full += line.text + '\n';
			if (line.cwdAfter) cwd = line.cwdAfter;
		});
		output.textContent = full;
		setTimeout(finish, 700);
		return;
	}

	var cursor = document.createElement('span');
	cursor.className = 'boot-cursor';

	var lineIndex = 0;
	var charIndex = 0;

	function typeChar() {
		if (skipped) return;
		if (lineIndex >= lines.length) {
			output.appendChild(cursor);
			setTimeout(finish, 900);
			return;
		}

		var line = lines[lineIndex];
		var prefix = line.type === 'cmd' ? host + ':' + cwd + '$ ' : '';
		var full = prefix + line.text;

		if (charIndex === 0 && prefix) {
			var promptSpan = document.createElement('span');
			promptSpan.className = 'boot-prompt';
			promptSpan.textContent = prefix;
			output.appendChild(promptSpan);
		}

		if (charIndex < line.text.length) {
			output.appendChild(document.createTextNode(line.text[charIndex]));
			charIndex++;
			setTimeout(typeChar, 22 + Math.random() * 30);
		} else {
			output.appendChild(document.createTextNode('\n'));
			if (line.cwdAfter) cwd = line.cwdAfter;
			lineIndex++;
			charIndex = 0;
			setTimeout(typeChar, 350);
		}
	}

	typeChar();
})();
