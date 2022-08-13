import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting';
import PasteLink from '../src/pastelink';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

/* global document, DataTransfer */

describe( 'PasteLink', () => {
	let domElement, editor, applyLinkCommand;

	beforeEach( async () => {
		domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );

		editor = await createEditor();

		applyLinkCommand = editor.commands.get( 'applyLink' );
	} );

	afterEach( async () => {
		domElement.remove();
		await editor.destroy();
		editor = null;
	} );

	it( 'is named', () => {
		expect( PasteLink.pluginName ).to.equal( 'PasteLink' );
	} );

	it( 'requires core link editing plugin', () => {
		expect( PasteLink.requires ).to.include( LinkEditing );
	} );

	describe( 'clipboard integration', () => {
		describe( 'valid URL interception', () => {
			generateValidPlainTextTestCase( 'https://reddit.com' );
			generateValidPlainTextTestCase( 'http://reddit.com' );
			generateValidPlainTextTestCase( 'http://reddit.com#with-some-hash' );
			generateValidPlainTextTestCase( 'http://reddit.com?with=some+query' );
			generateValidPlainTextTestCase( 'http://foo.dev' );
			generateValidPlainTextTestCase( 'https://101.101.101.101' );
			generateValidPlainTextTestCase( 'https://101.101.101.101/' );
			generateValidPlainTextTestCase( 'http://foo.local/document.txt' );

			function generateValidPlainTextTestCase( pastedPlainText ) {
				it( `works for plain text: ${ pastedPlainText }`, () => {
					// A linkable text needs to be selected.
					setData( editor.model, '<paragraph>[foo]</paragraph>' );

					const pasteEvent = pastePlainText( editor, pastedPlainText );

					expect( pasteEvent.preventDefault.calledOnce ).to.be.true;
					expect( applyLinkCommand.execute.callCount ).to.eql( 1 );
				} );
			}
		} );

		describe( 'invalid URL handling', () => {
			it( 'skips simple text', () => {
				// A linkable text needs to be selected.
				setData( editor.model, '<paragraph>[foo]</paragraph>' );

				pastePlainText( editor, 'foo' );

				expect( applyLinkCommand.execute.callCount ).to.equal( 0 );
			} );

			it( 'skips empty data transfer', () => {
				// A linkable text needs to be selected.
				setData( editor.model, '<paragraph>[foo]</paragraph>' );

				const dataTransfer = new DataTransfer();

				const doc = editor.editing.view.document;

				doc.fire( 'paste', {
					dataTransfer,
					preventDefault: sinon.stub(),
					stopPropagation: sinon.stub()
				} );

				expect( applyLinkCommand.execute.callCount ).to.equal( 0 );
			} );

			it( 'skips unhandled protocols', () => {
				// A linkable text needs to be selected.
				setData( editor.model, '<paragraph>[foo]</paragraph>' );

				pastePlainText( editor, 'custom://reddit.com' );

				expect( applyLinkCommand.execute.callCount ).to.eql( 0 );
			} );
		} );
	} );

	describe( 'config.protocols', () => {
		it( 'allows for new protocols', async () => {
			editor = await createEditor( {
				plugins: [
					Paragraph,
					Essentials,
					PasteLink
				],
				pasteLink: {
					protocols: [ 'my-custom-protocol' ]
				}
			} );

			// A linkable text needs to be selected.
			setData( editor.model, '<paragraph>[foo]</paragraph>' );

			pastePlainText( editor, 'my-custom-protocol://reddit.com' );

			expect( applyLinkCommand.execute.callCount ).to.equal( 1 );
			sinon.assert.calledWithExactly( applyLinkCommand.execute, 'my-custom-protocol://reddit.com' );
		} );

		it( 'default protocols can be removed', async () => {
			editor = await createEditor( {
				plugins: [
					Paragraph,
					Essentials,
					PasteLink
				],
				pasteLink: {
					protocols: [ 'foo' ]
				}
			} );

			// A linkable text needs to be selected.
			setData( editor.model, '<paragraph>[foo]</paragraph>' );

			pastePlainText( editor, 'https://reddit.com' );

			expect( applyLinkCommand.execute.callCount ).to.equal( 0 );
		} );
	} );

	async function createEditor( customConfig ) {
		// If a previous editor already exists destroy it.
		if ( editor ) {
			await editor.destroy();
		}

		const ret = await ClassicEditor.create( domElement, customConfig || {
			plugins: [
				Paragraph,
				Essentials,
				PasteLink
			]
		} );

		editor = ret;

		applyLinkCommand = ret.commands.get( 'applyLink' );

		sinon.spy( applyLinkCommand, 'execute' );

		return ret;
	}

	function pastePlainText( editor, text ) {
		const dataTransfer = new DataTransfer();
		dataTransfer.setData( 'text/plain', text );
		const pasteEvent = {
			dataTransfer,
			preventDefault: sinon.stub(),
			stopPropagation: sinon.stub()
		};

		editor.editing.view.document.fire( 'paste', pasteEvent );

		return pasteEvent;
	}
} );
