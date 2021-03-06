/**
 * External dependencies
 */
import { render } from 'enzyme';

/**
 * WordPress dependencies
 */
import { registerBlockType, unregisterBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import EmbedEdit from '../edit';
import {
	findMoreSuitableBlock,
	getClassNames,
	createUpgradedEmbedBlock,
	getEmbedInfoByProvider,
} from '../util';
import { embedInstagramIcon } from '../icons';
import variations from '../variations';
import metadata from '../block.json';

const { name: DEFAULT_EMBED_BLOCK, attributes } = metadata;

jest.mock( '@wordpress/data/src/components/use-select', () => () => ( {} ) );

describe( 'core/embed', () => {
	test( 'block edit matches snapshot', () => {
		const wrapper = render( <EmbedEdit attributes={ {} } /> );
		expect( wrapper ).toMatchSnapshot();
	} );
} );
describe( 'utils', () => {
	describe( 'findMoreSuitableBlock', () => {
		test( 'findMoreSuitableBlock matches a URL to a block name', () => {
			const twitterURL = 'https://twitter.com/notnownikki';
			const youtubeURL = 'https://www.youtube.com/watch?v=bNnfuvC1LlU';
			const unknownURL = 'https://example.com/';

			expect( findMoreSuitableBlock( twitterURL ) ).toEqual(
				expect.objectContaining( { name: 'twitter' } )
			);
			expect( findMoreSuitableBlock( youtubeURL ) ).toEqual(
				expect.objectContaining( { name: 'youtube' } )
			);
			expect( findMoreSuitableBlock( unknownURL ) ).toBeUndefined();
		} );
	} );
	describe( 'getClassNames', () => {
		test( 'getClassNames returns aspect ratio class names for iframes with width and height', () => {
			const html = '<iframe height="9" width="16"></iframe>';
			const expected = 'wp-embed-aspect-16-9 wp-has-aspect-ratio';
			expect( getClassNames( html ) ).toEqual( expected );
		} );

		test( 'getClassNames does not return aspect ratio class names if we do not allow responsive', () => {
			const html = '<iframe height="9" width="16"></iframe>';
			const expected = '';
			expect( getClassNames( html, '', false ) ).toEqual( expected );
		} );

		test( 'getClassNames preserves exsiting class names when removing responsive classes', () => {
			const html = '<iframe height="9" width="16"></iframe>';
			const expected = 'lovely';
			expect(
				getClassNames(
					html,
					'lovely wp-embed-aspect-16-9 wp-has-aspect-ratio',
					false
				)
			).toEqual( expected );
		} );
	} );
	describe( 'createUpgradedEmbedBlock', () => {
		describe( 'do not create new block', () => {
			it( 'when block type does not exist', () => {
				const youtubeURL = 'https://www.youtube.com/watch?v=dQw4w';
				expect(
					createUpgradedEmbedBlock( {
						attributes: { url: youtubeURL },
					} )
				).toBeUndefined();
			} );
			it( 'when no url provided', () => {
				expect(
					createUpgradedEmbedBlock( { name: 'some name' } )
				).toBeUndefined();
			} );
		} );

		it( 'should return a YouTube embed block when given a YouTube URL', () => {
			const youtubeURL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

			registerBlockType( DEFAULT_EMBED_BLOCK, {
				title: 'Embed',
				category: 'embed',
				attributes,
				variations,
			} );

			const result = createUpgradedEmbedBlock( {
				attributes: { url: youtubeURL },
			} );

			unregisterBlockType( DEFAULT_EMBED_BLOCK );

			expect( result ).toEqual(
				expect.objectContaining( {
					name: DEFAULT_EMBED_BLOCK,
					attributes: expect.objectContaining( {
						providerNameSlug: 'youtube',
					} ),
				} )
			);
		} );
	} );
	describe( 'getEmbedInfoByProvider', () => {
		it( 'should return embed info from existent variation', () => {
			expect( getEmbedInfoByProvider( 'instagram' ) ).toEqual(
				expect.objectContaining( {
					icon: embedInstagramIcon,
					title: 'Instagram',
				} )
			);
		} );
		it( 'should return undefined if not found in variations', () => {
			expect(
				getEmbedInfoByProvider( 'i do not exist' )
			).toBeUndefined();
		} );
	} );
} );
