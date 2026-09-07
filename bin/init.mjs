#!/usr/bin/env node

/**
 * Template initializer.
 *
 * Replaces every {{TOKEN}} of the template with the values of your plugin,
 * renames the tokenized paths, and removes itself.
 *
 * Usage:
 *   node bin/init.mjs
 *   node bin/init.mjs --dry-run
 *   node bin/init.mjs --values answers.json --yes
 *
 * The `--values` file holds a JSON object. Every key is a token, without the
 * braces. A missing token gets the same default as the interactive mode, so
 * `{ "PLUGIN_SLUG": "my-plugin" }` is enough. With `--values` the script does
 * not read the standard input, so an agent can run it.
 *
 * AUTHOR_NAME and AUTHOR_EMAIL are mandatory. They come from `git config`.
 * If git does not hold them, the interactive mode asks for them, and the
 * `--values` mode stops.
 */

import { createInterface } from 'node:readline/promises';
import { execFileSync } from 'node:child_process';
import { stdin, stdout, exit, argv, cwd } from 'node:process';
import { readdir, readFile, writeFile, rename, rm, rmdir, stat } from 'node:fs/promises';
import { join, relative, basename, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY_RUN = argv.includes('--dry-run');
const VALUES_FILE = readOption('--values');
const ASSUME_YES = argv.includes('--yes') || argv.includes('-y');

/**
 * Reads the value of a `--name value` or `--name=value` option.
 */
function readOption(name) {
	const index = argv.indexOf(name);

	if (index !== -1) {
		return argv[index + 1] ?? null;
	}

	const inline = argv.find((item) => item.startsWith(`${name}=`));

	return inline ? inline.slice(name.length + 1) : null;
}

const SKIP_DIRS = new Set([
	'.git',
	'node_modules',
	'vendor',
	'build',
	'artifacts',
	'.wp-env',
	'.idea',
	'.vscode',
]);

const BINARY_EXTENSIONS = new Set([
	'.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.avif',
	'.woff', '.woff2', '.ttf', '.eot', '.otf',
	'.zip', '.gz', '.pdf', '.mo', '.mp4', '.webm',
]);

const REMOVE_AFTER_INIT = ['bin', join('docs', 'superpowers')];

const TOKENS = [
	'PLUGIN_NAME',
	'PLUGIN_SLUG',
	'PLUGIN_DESCRIPTION',
	'VENDOR_NAMESPACE',
	'PLUGIN_NAMESPACE',
	'COMPOSER_NAME',
	'NPM_NAME',
	'TEXT_DOMAIN',
	'AUTHOR_NAME',
	'AUTHOR_EMAIL',
	'GITHUB_OWNER',
	'GITHUB_REPO',
	'CODEOWNER',
];

const REQUIRED_TOKENS = ['AUTHOR_NAME', 'AUTHOR_EMAIL'];

/**
 * Turns "my-plugin" into "My Plugin".
 */
function toTitle(slug) {
	return slug
		.split(/[-_\s]+/)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Turns "my-plugin" into "MyPlugin".
 */
function toPascal(slug) {
	return toTitle(slug).replace(/\s+/g, '');
}

/**
 * Turns "My Plugin" into "my-plugin".
 */
function toSlug(value) {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Reads one value of the git configuration. Returns an empty string when git
 * is absent, or when the key has no value.
 */
function gitConfig(key) {
	try {
		return execFileSync('git', ['config', '--get', key], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim();
	} catch {
		return '';
	}
}

/**
 * Stops the script when a mandatory token has no value.
 */
function assertRequired(values) {
	const missing = REQUIRED_TOKENS.filter((token) => !values[token]);

	if (missing.length > 0) {
		throw new Error(
			`Missing mandatory token: ${missing.join(', ')}. ` +
				'Configure git with `git config user.name` and `git config user.email`, ' +
				'or put AUTHOR_NAME and AUTHOR_EMAIL in the values file.'
		);
	}

	if (!isEmail(values.AUTHOR_EMAIL)) {
		throw new Error(`AUTHOR_EMAIL is not an email address: ${values.AUTHOR_EMAIL}`);
	}
}

/**
 * Checks the shape of an email address.
 */
function isEmail(value) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Turns "SpaghettiDojo" into "spaghetti-dojo".
 */
function toKebab(value) {
	return toSlug(value.replace(/([a-z0-9])([A-Z])/g, '$1-$2'));
}

async function collectFiles(dir, files = []) {
	const entries = await readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const path = join(dir, entry.name);

		if (entry.isDirectory()) {
			if (SKIP_DIRS.has(entry.name)) {
				continue;
			}
			await collectFiles(path, files);
			continue;
		}

		if (entry.isFile() && !BINARY_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
			files.push(path);
		}
	}

	return files;
}

function replaceTokens(content, values) {
	return content.replace(/\{\{([A-Z_]+)\}\}/g, (match, token) =>
		token in values ? values[token] : match
	);
}

/**
 * Removes the "Template setup" section of the README.
 */
function stripTemplateSection(content) {
	const lines = content.split('\n');
	const start = lines.findIndex((line) => /^##\s+Template setup\s*$/.test(line));

	if (start === -1) {
		return content;
	}

	let end = start + 1;
	while (end < lines.length && !/^##\s+/.test(lines[end])) {
		end += 1;
	}

	return [...lines.slice(0, start), ...lines.slice(end)].join('\n');
}

async function ask(lines, question, fallback) {
	stdout.write(fallback ? `${question} [${fallback}]: ` : `${question}: `);

	const { value, done } = await lines.next();

	if (done) {
		stdout.write('\n');

		if (!fallback) {
			throw new Error(`${question} has no answer, and it is mandatory.`);
		}

		return fallback;
	}

	const answer = String(value).trim();

	return answer === '' ? fallback : answer;
}

/**
 * Asks the same question until the answer is present and valid.
 */
async function askRequired(lines, question, fallback, validate) {
	for (;;) {
		const answer = await ask(lines, question, fallback);

		if (answer === '') {
			stdout.write('  This value is mandatory.\n');
			continue;
		}

		if (validate && !validate(answer)) {
			stdout.write('  This value has the wrong format.\n');
			continue;
		}

		return answer;
	}
}

/**
 * Builds the default value of every token from the answers that are present.
 */
function withDefaults(answers) {
	const slug = toSlug(answers.PLUGIN_SLUG || basename(cwd()));
	const vendorNamespace = answers.VENDOR_NAMESPACE || 'SpaghettiDojo';
	const vendorSlug = toKebab(vendorNamespace);

	return {
		PLUGIN_NAME: answers.PLUGIN_NAME || toTitle(slug),
		PLUGIN_SLUG: slug,
		PLUGIN_DESCRIPTION: answers.PLUGIN_DESCRIPTION || 'A WordPress plugin.',
		VENDOR_NAMESPACE: vendorNamespace,
		PLUGIN_NAMESPACE: answers.PLUGIN_NAMESPACE || toPascal(slug),
		COMPOSER_NAME: answers.COMPOSER_NAME || `${vendorSlug}/${slug}`,
		NPM_NAME: answers.NPM_NAME || `@${vendorSlug}/${slug}`,
		TEXT_DOMAIN: answers.TEXT_DOMAIN || slug,
		AUTHOR_NAME: answers.AUTHOR_NAME || gitConfig('user.name'),
		AUTHOR_EMAIL: answers.AUTHOR_EMAIL || gitConfig('user.email'),
		GITHUB_OWNER: answers.GITHUB_OWNER || 'Spaghetti-Dojo',
		GITHUB_REPO: answers.GITHUB_REPO || slug,
		CODEOWNER: answers.CODEOWNER || '@widoz',
	};
}

/**
 * Reads the answers from the `--values` file.
 */
async function valuesFromFile(path) {
	const raw = await readFile(path, 'utf8');
	const answers = JSON.parse(raw);

	if (answers === null || typeof answers !== 'object' || Array.isArray(answers)) {
		throw new Error(`${path} must hold a JSON object.`);
	}

	const unknown = Object.keys(answers).filter((key) => !TOKENS.includes(key));

	if (unknown.length > 0) {
		throw new Error(`Unknown token: ${unknown.join(', ')}`);
	}

	return withDefaults(answers);
}

async function collectValues() {
	const rl = createInterface({ input: stdin, output: stdout });
	const lines = rl[Symbol.asyncIterator]();

	try {
		const fallback = withDefaults({});
		const slug = toSlug(await ask(lines, 'Plugin slug', fallback.PLUGIN_SLUG));
		const step = (answers) => withDefaults({ ...answers, PLUGIN_SLUG: slug });

		const name = await ask(lines, 'Plugin name', step({}).PLUGIN_NAME);
		const description = await ask(lines, 'Description', fallback.PLUGIN_DESCRIPTION);
		const vendorNamespace = await ask(lines, 'Vendor namespace', fallback.VENDOR_NAMESPACE);
		const derived = step({ VENDOR_NAMESPACE: vendorNamespace });
		const pluginNamespace = await ask(lines, 'Plugin namespace', derived.PLUGIN_NAMESPACE);
		const composerName = await ask(lines, 'Composer name', derived.COMPOSER_NAME);
		const npmName = await ask(lines, 'NPM name', derived.NPM_NAME);
		const textDomain = await ask(lines, 'Text domain', derived.TEXT_DOMAIN);
		const authorName = await askRequired(lines, 'Author name', fallback.AUTHOR_NAME);
		const authorEmail = await askRequired(
			lines,
			'Author email',
			fallback.AUTHOR_EMAIL,
			isEmail
		);
		const githubOwner = await ask(lines, 'GitHub owner', fallback.GITHUB_OWNER);
		const githubRepo = await ask(lines, 'GitHub repository', derived.GITHUB_REPO);
		const codeowner = await ask(lines, 'Code owner', fallback.CODEOWNER);

		const values = withDefaults({
			PLUGIN_NAME: name,
			PLUGIN_SLUG: slug,
			PLUGIN_DESCRIPTION: description,
			VENDOR_NAMESPACE: vendorNamespace,
			PLUGIN_NAMESPACE: pluginNamespace,
			COMPOSER_NAME: composerName,
			NPM_NAME: npmName,
			TEXT_DOMAIN: textDomain,
			AUTHOR_NAME: authorName,
			AUTHOR_EMAIL: authorEmail,
			GITHUB_OWNER: githubOwner,
			GITHUB_REPO: githubRepo,
			CODEOWNER: codeowner,
		});

		stdout.write('\nSummary\n');
		for (const [token, value] of Object.entries(values)) {
			stdout.write(`  ${token.padEnd(20)} ${value}\n`);
		}

		const confirmed = await ask(lines, '\nApply these values? (y/n)', 'y');

		return confirmed.toLowerCase().startsWith('y') ? values : null;
	} finally {
		rl.close();
	}
}

async function applyValues(values) {
	const files = await collectFiles(ROOT);

	for (const file of files) {
		const original = await readFile(file, 'utf8');
		let next = replaceTokens(original, values);

		if (basename(file) === 'README.md') {
			next = stripTemplateSection(next);
		}

		if (next !== original) {
			stdout.write(`  update  ${relative(ROOT, file)}\n`);
			DRY_RUN || (await writeFile(file, next));
		}

		const target = join(dirname(file), replaceTokens(basename(file), values));

		if (target !== file) {
			stdout.write(`  rename  ${relative(ROOT, file)} -> ${relative(ROOT, target)}\n`);
			DRY_RUN || (await rename(file, target));
		}
	}

	for (const path of REMOVE_AFTER_INIT) {
		const absolute = join(ROOT, path);

		try {
			await stat(absolute);
		} catch {
			continue;
		}

		stdout.write(`  remove  ${path}\n`);
		DRY_RUN || (await rm(absolute, { recursive: true, force: true }));

		const parent = dirname(absolute);

		if (parent !== ROOT && !DRY_RUN) {
			await rmdir(parent).catch(() => undefined);
		}
	}
}

async function main() {
	stdout.write('Initialize the WordPress plugin template.\n');
	DRY_RUN && stdout.write('Dry run. No file is written.\n');
	stdout.write('\n');

	const values = VALUES_FILE
		? await valuesFromFile(VALUES_FILE)
		: await collectValues();

	values && assertRequired(values);

	if (!values) {
		stdout.write('Cancelled. No file changed.\n');
		exit(1);
	}

	if (VALUES_FILE) {
		stdout.write('Values\n');
		for (const [token, value] of Object.entries(values)) {
			stdout.write(`  ${token.padEnd(20)} ${value}\n`);
		}

		if (!ASSUME_YES && !DRY_RUN) {
			stdout.write('\nAdd --yes to apply these values.\n');
			exit(1);
		}
	}

	stdout.write('\n');
	await applyValues(values);

	stdout.write('\nDone. Next steps:\n');
	stdout.write('  composer install\n');
	stdout.write('  pnpm install\n');
	stdout.write('  pnpm build\n');
	stdout.write('  pnpm wp-env start\n');
}

main().catch((error) => {
	stdout.write(`\nError: ${error.message}\n`);
	exit(1);
});
