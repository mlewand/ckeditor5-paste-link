import { Plugin } from 'ckeditor5/src/core';

/* global console, URL */

const HANDLED_PROTOCOLS = [ 'http', 'https' ];

export default class PasteLink extends Plugin {
	static get pluginName() {
		return 'PasteLink';
	}

	init() {
		const { editor } = this;
		const viewDocument = editor.editing.view.document;

		this.listenTo( viewDocument, 'paste', ( eventInfo, clipboardData ) => {
			const pastedURL = clipboardData.dataTransfer.getData( 'text/plain' );

			if ( isValidURL( pastedURL ) ) {
				console.log( 'handled' );
				eventInfo.stop();
				clipboardData.preventDefault();
				clipboardData.stopPropagation();
				return false;
			}
		} );
	}
}

function isValidURL( url ) {
	try {
		const parsedUrl = new URL( url );

		// The browser is adding a colon at the end of value, strip it.
		const protocol = parsedUrl.protocol.toLocaleLowerCase().substring( 0, parsedUrl.protocol.length - 1 );

		return HANDLED_PROTOCOLS.includes( protocol );
	} catch ( error ) {
		return false;
	}
}
