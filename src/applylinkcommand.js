
import { Command } from 'ckeditor5/src/core';
// import { isLinkableElement } from '@ckeditor/ckeditor5-link/src/utils';

const LINK_MODEL_ATTRIBUTE_NAME = 'linkHref';

/**
 * Applies link attribute to the editor selection.
 */
export default class ApplyLinkCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = true;
	}

	/**
	 *
	 * @param {String} url URL to be applied. Should include the protocol.
	 */
	execute( url ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			for ( const range of selection.getRanges() ) {
				for ( const walkerEntry of range ) {
					const modelItem = walkerEntry.item;
					if ( model.schema.checkAttribute( modelItem, LINK_MODEL_ATTRIBUTE_NAME ) ) {
						writer.setAttribute( LINK_MODEL_ATTRIBUTE_NAME, url, modelItem );
					}
				}
			}
		} );
	}
}
