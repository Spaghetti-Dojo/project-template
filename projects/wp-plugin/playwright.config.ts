import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

process.env.WP_ARTIFACTS_PATH ??= path.join( process.cwd(), 'artifacts' );

const baseUrl = process.env.WP_BASE_URL || 'http://localhost:8877';

export default defineConfig( {
	reporter: process.env.CI ? [ [ 'github' ] ] : [ [ 'list' ] ],
	forbidOnly: !! process.env.CI,
	workers: 1,
	retries: process.env.CI ? 2 : 0,
	timeout: 100_000,
	reportSlowTests: null,
	testDir: './tests/e2e/specs',
	outputDir: path.join( process.env.WP_ARTIFACTS_PATH, 'test-results' ),
	use: {
		baseURL: baseUrl,
		headless: true,
		viewport: { width: 960, height: 700 },
		ignoreHTTPSErrors: true,
		locale: 'en-US',
		contextOptions: {
			reducedMotion: 'reduce',
			strictSelectors: true,
		},
		actionTimeout: 10_000,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		video: 'on-first-retry',
	},
	webServer: {
		command: 'pnpm wp-env start',
		url: baseUrl,
		timeout: 120_000,
		reuseExistingServer: true,
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices[ 'Desktop Chrome' ] },
		},
	],
} );
