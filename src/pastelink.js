import { Plugin } from 'ckeditor5/src/core';
/* global console */

export default class PasteLink extends Plugin {
	static get pluginName() {
		return 'PasteLink';
	}

	init() {
		const { editor } = this;
		const viewDocument = editor.editing.view.document;

		this.listenTo( viewDocument, 'paste', ( eventInfo, clipboardData ) => {
			const pastedURL = clipboardData.dataTransfer.getData( 'text/plain' );

			// console.log( 'paste', pastedURL );
			// console.log( clipboardData );

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
	// @todo: add a real implementation.
	return !!url && url.startsWith( 'https' );
}
