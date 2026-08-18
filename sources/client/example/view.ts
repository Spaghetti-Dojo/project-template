import { store, getContext } from '@wordpress/interactivity';

import type { ExampleContext } from './types';

store( '{{PLUGIN_SLUG}}', {
	actions: {
		increment(): void {
			const context = getContext< ExampleContext >();
			context.count += 1;
		},
	},
} );
