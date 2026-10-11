/**
 * Helpers that copy a template and run its initializer.
 *
 * The copy holds the same files that a user gets: the tracked files of the
 * template directory, with the template directory as the root.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPOSITORY_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const SKIP_DIRS = new Set(['.git', 'node_modules', 'vendor']);

/**
 * Copies the template into a new temporary directory.
 *
 * The name of the project directory matters: the initializer uses it as the
 * default slug.
 *
 * @return The path of the project directory.
 */
export async function copyTemplate(template, projectName) {
	const source = join(REPOSITORY_ROOT, 'projects', template);
	const target = join(await mkdtemp(join(tmpdir(), `${template}-`)), projectName);

	// The untracked files are part of the copy, so a test covers work that
	// is not committed. The ignored files are not.
	const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], {
		cwd: source,
		encoding: 'utf8',
	})
		.split('\0')
		.filter(Boolean);

	for (const file of files) {
		await mkdir(dirname(join(target, file)), { recursive: true });
		await cp(join(source, file), join(target, file));
	}

	return target;
}

/**
 * Removes the temporary directory of a project.
 */
export async function removeProject(project) {
	await rm(dirname(project), { recursive: true, force: true });
}

/**
 * Runs the initializer in the project.
 *
 * The run does not read the git config of the machine. Pass `author` to set
 * `user.name` and `user.email`, as git would give them.
 *
 * @param answers One line per question of the initializer.
 */
export function runInit(project, { answers = [], args = [], author = null } = {}) {
	const env = {
		...process.env,
		GIT_CONFIG_GLOBAL: '/dev/null',
		GIT_CONFIG_SYSTEM: '/dev/null',
		GIT_CONFIG_COUNT: '0',
	};

	if (author) {
		env.GIT_CONFIG_COUNT = '2';
		env.GIT_CONFIG_KEY_0 = 'user.name';
		env.GIT_CONFIG_VALUE_0 = author.name;
		env.GIT_CONFIG_KEY_1 = 'user.email';
		env.GIT_CONFIG_VALUE_1 = author.email;
	}

	return spawnSync('node', ['bin/init.mjs', ...args], {
		cwd: project,
		env,
		input: answers.map((answer) => `${answer}\n`).join(''),
		encoding: 'utf8',
	});
}

/**
 * Runs a command in the project.
 */
export function run(project, command, args) {
	return spawnSync(command, args, { cwd: project, encoding: 'utf8' });
}

/**
 * Lists the files of the project, relative to its root.
 */
export async function listFiles(project, dir = project, files = []) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);

		if (entry.isDirectory()) {
			SKIP_DIRS.has(entry.name) || (await listFiles(project, path, files));
			continue;
		}

		files.push(relative(project, path));
	}

	return files.sort();
}

/**
 * Reads every file of the project into a map of path to content.
 */
export async function readFiles(project) {
	const contents = new Map();

	for (const file of await listFiles(project)) {
		contents.set(file, await readFile(join(project, file), 'utf8'));
	}

	return contents;
}
