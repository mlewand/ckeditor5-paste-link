import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting';
import PasteLink from '../src/pastelink';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

/* global document, DataTransfer */

describe( 'PasteLink', () => {
	let domElement, editor;

	beforeEach( async () => {
		domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				Paragraph,
				Heading,
				Essentials,
				PasteLink
			]
		} );
	} );

	afterEach( () => {
		domElement.remove();
		return editor.destroy();
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

					const dataTransfer = new DataTransfer();
					dataTransfer.setData( 'text/plain', pastedPlainText );
					const pasteStub = sinon.stub();
					const preventDefaultStub = sinon.stub();

					const doc = editor.editing.view.document;

					doc.on( 'paste', pasteStub, {
						priority: 'low'
					} );

					doc.fire( 'paste', {
						dataTransfer,
						preventDefault: preventDefaultStub,
						stopPropagation: sinon.stub()
					} );

					expect( preventDefaultStub.calledOnce ).to.be.true;
					expect( pasteStub.callCount ).to.equal( 0 );
				} );
			}
		} );

		describe( 'invalid URL handling', () => {
			it( 'skips simple text', () => {
				// A linkable text needs to be selected.
				setData( editor.model, '<paragraph>[foo]</paragraph>' );

				const dataTransfer = new DataTransfer();
				dataTransfer.setData( 'text/plain', 'foo' );
				const pasteStub = sinon.stub();

				const doc = editor.editing.view.document;

				doc.on( 'paste', pasteStub, {
					priority: 'low'
				} );

				doc.fire( 'paste', {
					dataTransfer,
					preventDefault: sinon.stub(),
					stopPropagation: sinon.stub()
				} );

				expect( pasteStub.callCount ).to.equal( 1 );
			} );

			it( 'skips empty data transfer', () => {
				// A linkable text needs to be selected.
				setData( editor.model, '<paragraph>[foo]</paragraph>' );

				const dataTransfer = new DataTransfer();
				const pasteStub = sinon.stub();

				const doc = editor.editing.view.document;

				doc.on( 'paste', pasteStub, {
					priority: 'low'
				} );

				doc.fire( 'paste', {
					dataTransfer,
					preventDefault: sinon.stub(),
					stopPropagation: sinon.stub()
				} );

				expect( pasteStub.callCount ).to.equal( 1 );
			} );

			it( 'skips unhandled protocols', () => {
				// A linkable text needs to be selected.
				setData( editor.model, '<paragraph>[foo]</paragraph>' );

				const dataTransfer = new DataTransfer();
				dataTransfer.setData( 'text/plain', 'custom://reddit.com' );
				const pasteStub = sinon.stub();

				const doc = editor.editing.view.document;

				doc.on( 'paste', pasteStub, {
					priority: 'low'
				} );

				doc.fire( 'paste', {
					dataTransfer,
					preventDefault: sinon.stub(),
					stopPropagation: sinon.stub()
				} );

				expect( pasteStub.callCount ).to.equal( 1 );
			} );
		} );
	} );
} );
