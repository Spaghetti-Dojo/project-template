import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { createElement } from '@wordpress/element';

import metadata from './block.json';
import type { ExampleAttributes } from './types';

import './style.scss';

registerBlockType< ExampleAttributes >( metadata.name, {
	edit( { attributes } ) {
		const blockProps = useBlockProps();

		return createElement(
			'div',
			blockProps,
			createElement(
				'p',
				null,
				`${ attributes.label }: ${ attributes.start }`
			),
			createElement( 'button', { type: 'button', disabled: true }, __( 'Increment', '{{TEXT_DOMAIN}}' ) )
		);
	},
	save() {
		return null;
	},
} );
