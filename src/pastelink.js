import { Plugin } from 'ckeditor5/src/core';
import { LinkEditing } from '@ckeditor/ckeditor5-link';
import ApplyLinkCommand from './applylinkcommand';

/* global URL */

const DEFAULT_PROTOCOLS = [ 'http', 'https' ];

export default class PasteLink extends Plugin {
	static get requires() {
		return [ LinkEditing ];
	}

	static get pluginName() {
		return 'PasteLink';
	}

	init() {
		this._registerCommands();
		this._addPasteListener();
	}

	_addPasteListener() {
		const { editor } = this;
		const viewDocument = editor.editing.view.document;

		this.listenTo( viewDocument, 'paste', ( eventInfo, clipboardData ) => {
			const pastedURL = clipboardData.dataTransfer.getData( 'text/plain' );

			if ( !isValidURL( pastedURL, editor.config.get( 'pasteLink.protocols' ) ) ) {
				return;
			}

			const command = editor.commands.get( 'applyLink' );

			if ( !command.isEnabled ) {
				// Could be disabled if selected element can not have a link. In this case
				// we want to proceed with uninterrupted handling.
				return;
			}

			command.execute( pastedURL );

			stopEvents( eventInfo, clipboardData );
		} );

		/**
		 * @param {String} url URL to be tested.
		 * @param {Array.<String>} [supportedProtocols] A list of allowed protocols.
		 * @returns {Boolean} `true` if given `url` is a valid URL.
		 */
		function isValidURL( url, supportedProtocols ) {
			try {
				const parsedUrl = new URL( url );

				// The browser is adding a colon at the end of value, strip it.
				const protocol = parsedUrl.protocol.toLocaleLowerCase().substring( 0, parsedUrl.protocol.length - 1 );

				return ( supportedProtocols || DEFAULT_PROTOCOLS ).includes( protocol );
			} catch ( error ) {
				return false;
			}
		}

		function stopEvents( eventInfo, clipboardData ) {
			eventInfo.stop();
			clipboardData.preventDefault();
			clipboardData.stopPropagation();
		}
	}

	_registerCommands() {
		this.editor.commands.add( 'applyLink', new ApplyLinkCommand( this.editor ) );
	}
}
