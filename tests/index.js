import { PasteLink as PasteLinkDll, icons } from '../src';
import PasteLink from '../src/pastelink';

import ckeditor from './../theme/icons/ckeditor.svg';

describe( 'CKEditor5 PasteLink DLL', () => {
	it( 'exports PasteLink', () => {
		expect( PasteLinkDll ).to.equal( PasteLink );
	} );

	describe( 'icons', () => {
		it( 'exports the "ckeditor" icon', () => {
			expect( icons.ckeditor ).to.equal( ckeditor );
		} );
	} );
} );
