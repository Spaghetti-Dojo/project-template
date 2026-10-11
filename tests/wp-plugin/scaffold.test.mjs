/**
 * The scaffold of the `wp-plugin` template.
 *
 * Each test copies the template, as a user does, and runs the initializer.
 * No test installs a dependency. See `install.test.mjs` for that.
 */

import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { copyTemplate, listFiles, readFiles, removeProject, runInit } from '../helpers/scaffold.mjs';

const TOKEN = /\{\{[A-Z_]+\}\}/;

const AUTHOR = { name: 'Jane Doe', email: 'jane@example.com' };

// One answer per question of the initializer, in the order of the questions.
const ANSWERS = [
	'acme-tool', // Plugin slug
	'Acme Tool', // Plugin name
	'A dummy plugin.', // Description
	'Acme', // Vendor namespace
	'AcmeTool', // Plugin namespace
	'acme/acme-tool', // Composer name
	'@acme/acme-tool', // NPM name
	'acme-text', // Text domain
	AUTHOR.name, // Author name
	AUTHOR.email, // Author email
	'acme-org', // GitHub owner
	'acme-repo', // GitHub repository
	'y', // Apply these values?
];

async function readJson(project, file) {
	return JSON.parse(await readFile(join(project, file), 'utf8'));
}

describe('wp-plugin template', () => {
	let project;

	beforeEach(async () => {
		project = await copyTemplate('wp-plugin', 'dummy-plugin');
	});

	afterEach(async () => {
		await removeProject(project);
	});

	test('the copy does not know the repository of the template', async () => {
		for (const [file, content] of await readFiles(project)) {
			assert.doesNotMatch(content, /projects\/wp-plugin/, file);
		}
	});

	describe('with an answer to each question', () => {
		let result;

		beforeEach(() => {
			result = runInit(project, { answers: ANSWERS });
		});

		test('the initializer succeeds', () => {
			assert.equal(result.status, 0, result.stdout + result.stderr);
		});

		test('no token stays in a file or in a path', async () => {
			for (const [file, content] of await readFiles(project)) {
				assert.doesNotMatch(file, TOKEN);
				assert.doesNotMatch(content, TOKEN, file);
			}
		});

		test('the plugin file gets the slug as its name', async () => {
			const content = await readFile(join(project, 'acme-tool.php'), 'utf8');

			assert.match(content, /^ \* Plugin Name: Acme Tool$/m);
			assert.match(content, /^ \* Description: A dummy plugin\.$/m);
			assert.match(content, /^ \* Author: Jane Doe$/m);
			assert.match(content, /^ \* Text Domain: acme-text$/m);
			assert.match(content, /^namespace Acme\\AcmeTool;$/m);
		});

		test('composer.json gets the values', async () => {
			const composer = await readJson(project, 'composer.json');

			assert.equal(composer.name, 'acme/acme-tool');
			assert.equal(composer.description, 'A dummy plugin.');
			assert.deepEqual(composer.authors, [AUTHOR]);
			assert.equal(composer.autoload['psr-4']['Acme\\AcmeTool\\'], 'sources/server/');
		});

		test('package.json gets the values', async () => {
			const manifest = await readJson(project, 'package.json');

			assert.equal(manifest.name, '@acme/acme-tool');
			assert.equal(manifest.author, 'Jane Doe <jane@example.com>');
			assert.equal(manifest.repository.url, 'https://github.com/acme-org/acme-repo');
		});

		test('package.json loses the script of the initializer', async () => {
			const manifest = await readJson(project, 'package.json');

			assert.equal('init:template' in manifest.scripts, false);
			assert.equal(typeof manifest.scripts.build, 'string');
		});

		test('the initializer removes itself', () => {
			assert.equal(existsSync(join(project, 'bin')), false);
		});

		test('the README loses the "Template setup" section', async () => {
			const readme = await readFile(join(project, 'README.md'), 'utf8');

			assert.match(readme, /^# Acme Tool$/m);
			assert.doesNotMatch(readme, /Template setup/);
			assert.match(readme, /^## Requirements$/m);
		});
	});

	describe('with no answer', () => {
		test('the defaults come from the directory and from git', async () => {
			const result = runInit(project, { author: AUTHOR });

			assert.equal(result.status, 0, result.stdout + result.stderr);

			const composer = await readJson(project, 'composer.json');

			assert.equal(existsSync(join(project, 'dummy-plugin.php')), true);
			assert.equal(composer.name, 'spaghettidojo/dummy-plugin');
			assert.deepEqual(composer.authors, [AUTHOR]);
			assert.equal(composer.autoload['psr-4']['SpaghettiDojo\\DummyPlugin\\'], 'sources/server/');
		});

		test('the initializer stops when git has no author', async () => {
			const before = await readFiles(project);
			const result = runInit(project);

			assert.equal(result.status, 1);
			assert.match(result.stdout, /Author name is mandatory/);
			assert.deepEqual(await readFiles(project), before);
		});
	});

	test('the initializer asks again for an email that is not valid', async () => {
		const answers = [...ANSWERS];
		answers.splice(9, 0, 'not-an-email');

		const result = runInit(project, { answers });
		const composer = await readJson(project, 'composer.json');

		assert.equal(result.status, 0, result.stdout + result.stderr);
		assert.match(result.stdout, /Author email is mandatory\. Give a valid value\./);
		assert.deepEqual(composer.authors, [AUTHOR]);
	});

	test('the answer "n" changes no file', async () => {
		const before = await readFiles(project);
		const result = runInit(project, { answers: [...ANSWERS.slice(0, -1), 'n'] });

		assert.equal(result.status, 1);
		assert.match(result.stdout, /Cancelled/);
		assert.deepEqual(await readFiles(project), before);
	});

	test('--dry-run changes no file', async () => {
		const before = await listFiles(project);
		const contents = await readFiles(project);
		const result = runInit(project, { answers: ANSWERS, args: ['--dry-run'] });

		assert.equal(result.status, 0, result.stdout + result.stderr);
		assert.match(result.stdout, /rename {2}\{\{PLUGIN_SLUG\}\}\.php -> acme-tool\.php/);
		assert.deepEqual(await listFiles(project), before);
		assert.deepEqual(await readFiles(project), contents);
	});
});
