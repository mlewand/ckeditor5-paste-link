
import { Command } from 'ckeditor5/src/core';

const LINK_MODEL_ATTRIBUTE_NAME = 'linkHref';

/**
 * Applies link attribute to the editor selection.
 */
export default class ApplyLinkCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this._canExecuteFor( this.editor.model.document.selection );
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

	/**
	 * Tells whether command can be applied to a given selection.
	 *
	 * Reason why this isn't checked
	 *
	 * @private
	 * @param {module:engine/model/selection~Selection} selection
	 * @returns {Boolean}
	 */
	_canExecuteFor( selection ) {
		for ( const range of selection.getRanges() ) {
			for ( const { item } of range ) {
				if ( this.editor.model.schema.checkAttribute( item, LINK_MODEL_ATTRIBUTE_NAME ) ) {
					// It's crucial for performance reasons to leave early here. You don't want to
					// iterate though all selected elements in case someone used select all feature in
					// a huge document.
					return true;
				}
			}
		}

		return false;
	}
}
