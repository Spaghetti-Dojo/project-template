const path = require( 'node:path' );

module.exports = require(
	path.join( __dirname, 'node_modules', '@wordpress', 'prettier-config' )
);
