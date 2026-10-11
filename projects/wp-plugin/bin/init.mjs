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
 */

import { createInterface } from 'node:readline/promises';
import { stdin, stdout, exit, argv, cwd } from 'node:process';
import { readdir, readFile, writeFile, rename, rm, rmdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join, relative, basename, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY_RUN = argv.includes('--dry-run');

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

const REMOVE_AFTER_INIT = ['bin'];

const REMOVE_SCRIPTS = ['init:template'];

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

/**
 * Removes the scripts of package.json that start the initializer.
 */
function stripTemplateScripts(content) {
	const manifest = JSON.parse(content);

	for (const script of REMOVE_SCRIPTS) {
		delete manifest.scripts?.[script];
	}

	return `${JSON.stringify(manifest, null, '\t')}\n`;
}

function gitConfig(key) {
	try {
		return execFileSync('git', ['config', '--get', key], { encoding: 'utf8' }).trim();
	} catch {
		return '';
	}
}

async function ask(lines, question, fallback) {
	stdout.write(`${question} [${fallback}]: `);

	const { value, done } = await lines.next();

	if (done) {
		stdout.write('\n');

		return fallback;
	}

	const answer = String(value).trim();

	return answer === '' ? fallback : answer;
}

/**
 * Asks a question that the user must answer.
 *
 * The initial value comes from the git config. The question repeats until the
 * answer passes the validator.
 */
async function askRequired(lines, question, initial, isValid) {
	const fallback = isValid(initial) ? initial : '';

	for (;;) {
		stdout.write(fallback === '' ? `${question}: ` : `${question} [${fallback}]: `);

		const { value, done } = await lines.next();

		if (done) {
			if (fallback !== '') {
				stdout.write('\n');

				return fallback;
			}

			throw new Error(`${question} is mandatory. Configure git, or answer the question.`);
		}

		const answer = String(value).trim() || fallback;

		if (isValid(answer)) {
			return answer;
		}

		stdout.write(`  ${question} is mandatory. Give a valid value.\n`);
	}
}

function isName(value) {
	return value.trim() !== '';
}

function isEmail(value) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

async function collectValues() {
	const rl = createInterface({ input: stdin, output: stdout });
	const lines = rl[Symbol.asyncIterator]();

	try {
		const dirSlug = toSlug(basename(cwd()));
		const slug = await ask(lines, 'Plugin slug', dirSlug);
		const name = await ask(lines, 'Plugin name', toTitle(slug));
		const description = await ask(lines, 'Description', 'A WordPress plugin.');
		const vendorNamespace = await ask(lines, 'Vendor namespace', 'SpaghettiDojo');
		const pluginNamespace = await ask(lines, 'Plugin namespace', toPascal(slug));
		const vendorSlug = toSlug(vendorNamespace);
		const composerName = await ask(lines, 'Composer name', `${vendorSlug}/${slug}`);
		const npmName = await ask(lines, 'NPM name', `@${vendorSlug}/${slug}`);
		const textDomain = await ask(lines, 'Text domain', slug);
		const authorName = await askRequired(lines, 'Author name', gitConfig('user.name'), isName);
		const authorEmail = await askRequired(lines, 'Author email', gitConfig('user.email'), isEmail);
		const githubOwner = await ask(lines, 'GitHub owner', vendorSlug);
		const githubRepo = await ask(lines, 'GitHub repository', slug);

		const values = {
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
		};

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

		if (relative(ROOT, file) === 'package.json') {
			next = stripTemplateScripts(next);
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

	const values = await collectValues();

	if (!values) {
		stdout.write('Cancelled. No file changed.\n');
		exit(1);
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
