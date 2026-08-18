import { test, expect } from '@playwright/test';

const SELECTORS = {
	block: '.wp-block-{{PLUGIN_SLUG}}-example',
	value: '.{{PLUGIN_SLUG}}-example__value',
	button: '.{{PLUGIN_SLUG}}-example__button',
};

test.describe( 'Example block', () => {
	test( 'renders on the front end', async ( { page } ) => {
		await page.goto( '/?{{PLUGIN_SLUG}}-test=1' );

		const block = page.locator( SELECTORS.block ).first();

		await expect( block ).toBeVisible();
		await expect( block.locator( SELECTORS.value ) ).toHaveText( '0' );
	} );

	test( 'increments the counter on click', async ( { page } ) => {
		await page.goto( '/?{{PLUGIN_SLUG}}-test=1' );

		const block = page.locator( SELECTORS.block ).first();

		await block.locator( SELECTORS.button ).click();

		await expect( block.locator( SELECTORS.value ) ).toHaveText( '1' );
	} );
} );
