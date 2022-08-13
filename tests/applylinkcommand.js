
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import ApplyLinkCommand from '../src/applylinkcommand';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting';
import PasteLink from '../src/pastelink';

/* global document */

describe( 'ApplyLinkCommand', () => {
	let domElement, editor, model, command;

	beforeEach( async () => {
		domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				Paragraph,
				Essentials,
				LinkEditing,
				PasteLink
			]
		} );

		model = editor.model;
		command = new ApplyLinkCommand( editor );

		// Custom elements.
		model.schema.register( 'non-linkable', {
			isObject: true,
			allowIn: 'paragraph'
		} );

		const { conversion } = editor;

		conversion.elementToElement( {
			model: 'non-linkable',
			view: 'non-linkable-element'
		} );
	} );

	afterEach( () => {
		domElement.remove();
		return editor.destroy();
	} );

	it( 'is declared to affect editor data', () => {
		expect( command.affectsData ).to.be.true;
	} );

	describe( 'isEnabled', () => {
		// @todo: so far it's always enabled. Ensure what's expected.
	} );

	describe( 'execute()', () => {
		it( 'applies given URL to selected text', () => {
			setData( model, '<paragraph>[foo]</paragraph>' );

			command.execute( 'https://reddit.com' );
			expect( getData( model ) ).to.equal( '<paragraph>[<$text linkHref="https://reddit.com">foo</$text>]</paragraph>' );
		} );

		it( 'applies given URL to multiple ranges', () => {
			setData( model, '<paragraph>[aa] bb [cc] dd</paragraph>' );

			command.execute( 'http://reddit.com' );
			expect( getData( model ) ).to.equal( '<paragraph>[<$text linkHref="http://reddit.com">aa</$text>]' +
				' bb ' +
				'[<$text linkHref="http://reddit.com">cc</$text>]' +
				' dd</paragraph>' );
		} );

		it( 'will apply URL to custom model items that allow it', () => {
			model.schema.register( 'custom-linkable', {
				allowAttributes: [ 'linkHref' ],
				isObject: true,
				allowIn: 'paragraph'
			} );

			const { conversion } = editor;

			conversion.elementToElement( {
				model: 'custom-linkable',
				view: 'custom-linkable-element'
			} );

			setData( model, '<paragraph>[foo <custom-linkable></custom-linkable>bar] baz</paragraph>' );

			command.execute( 'http://reddit.com' );

			expect( getData( model ) ).to.equal( '<paragraph>[<$text linkHref="http://reddit.com">foo </$text>' +
				'<custom-linkable linkHref="http://reddit.com"></custom-linkable>' +
				'<$text linkHref="http://reddit.com">bar</$text>]' +
				' baz</paragraph>' );
		} );

		it( 'won\'t apply URL model items that doesn\'t support it', () => {
			setData( model, '<paragraph>[foo <non-linkable></non-linkable>bar] baz</paragraph>' );

			command.execute( 'http://reddit.com' );

			expect( getData( model ) ).to.equal( '<paragraph>[<$text linkHref="http://reddit.com">foo </$text>' +
				'<non-linkable></non-linkable>' +
				'<$text linkHref="http://reddit.com">bar</$text>]' +
				' baz</paragraph>' );
		} );
	} );

	describe( '_canExecuteFor()', () => {
		it( 'works correctly for text', () => {
			setData( model, '<paragraph>f[o]o</paragraph>' );

			expect( command._canExecuteFor( model.document.selection ) ).to.be.true;
		} );

		it( 'works correctly non-linkable alone', () => {
			setData( model, '<paragraph>f[<non-linkable></non-linkable>]o</paragraph>' );

			expect( command._canExecuteFor( model.document.selection ) ).to.be.false;
		} );

		it( 'works correctly with mixed content: text and non-linkable', () => {
			setData( model, '<paragraph>f[o<non-linkable></non-linkable>]o</paragraph>' );

			expect( command._canExecuteFor( model.document.selection ) ).to.be.true;
		} );
	} );
} );
