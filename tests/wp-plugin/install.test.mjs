/**
 * The installation of a project that comes from the `wp-plugin` template.
 *
 * The test initializes one copy of the template with dummy values. Then it
 * runs the commands of the `qa.yml` and `lint.yml` workflows of the template,
 * in the same order. Keep the list equal to the workflows.
 *
 * The test needs PHP, Composer, pnpm and a network connection. It does not
 * run the `e2e.yml` workflow, which needs Docker.
 */

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';

import { copyTemplate, removeProject, run, runInit } from '../helpers/scaffold.mjs';

const ANSWERS = [
	'acme-tool', // Plugin slug
	'Acme Tool', // Plugin name
	'A dummy plugin.', // Description
	'Acme', // Vendor namespace
	'AcmeTool', // Plugin namespace
	'acme/acme-tool', // Composer name
	'@acme/acme-tool', // NPM name
	'acme-tool', // Text domain
	'Jane Doe', // Author name
	'jane@example.com', // Author email
	'acme', // GitHub owner
	'acme-tool', // GitHub repository
	'y', // Apply these values?
];

// Each check needs the result of every setup command.
const SETUP = [
	['composer', ['install', '--no-interaction', '--prefer-dist']],
	['pnpm', ['install', '--frozen-lockfile']],
	['pnpm', ['build']],
];

const CHECKS = [
	['composer', ['cs']],
	['composer', ['analysis']],
	['composer', ['tests']],
	['pnpm', ['lint:scripts']],
	['pnpm', ['lint:styles']],
	['pnpm', ['lint:types']],
	['pnpm', ['test:unit']],
];

describe('wp-plugin template, after the initializer', () => {
	let project;
	let setupFailed = false;

	before(async () => {
		project = await copyTemplate('wp-plugin', 'acme-tool');

		const result = runInit(project, { answers: ANSWERS });

		assert.equal(result.status, 0, result.stdout + result.stderr);
	});

	after(async () => {
		await removeProject(project);
	});

	for (const [command, args] of SETUP) {
		test(`${command} ${args.join(' ')}`, (t) => {
			if (setupFailed) {
				t.skip('an earlier setup command failed');

				return;
			}

			const result = run(project, command, args);

			setupFailed = result.status !== 0;

			assert.equal(result.status, 0, result.stdout + result.stderr);
		});
	}

	for (const [command, args] of CHECKS) {
		test(`${command} ${args.join(' ')}`, (t) => {
			if (setupFailed) {
				t.skip('a setup command failed');

				return;
			}

			const result = run(project, command, args);

			assert.equal(result.status, 0, result.stdout + result.stderr);
		});
	}
});
