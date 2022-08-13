import { PasteLink as PasteLinkDll } from '../src';
import PasteLink from '../src/pastelink';

describe( 'CKEditor5 PasteLink DLL', () => {
	it( 'exports PasteLink', () => {
		expect( PasteLinkDll ).to.equal( PasteLink );
	} );
} );
