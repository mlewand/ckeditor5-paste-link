# CKEditor5 paste link

CKEditor 5 plugin that links the selected content with an URL from the clipboard.

https://user-images.githubusercontent.com/5353898/184495493-d4984eee-699b-4e7b-a0d1-03d3f9f57dbb.mp4

## Configuration options

### `pasteLink.protocols`

Allows to change the list of accepted protocols.

```js
editor = await ClassicEditor.create( domElement, {
		plugins: [
			Paragraph,
			Essentials,
			PasteLink
		],
		pasteLink: {
			protocols: [ 'ftp', 'http', 'https', 'mailto', 'custom-protocol' ]
		}
	} );
```

Array of strings. Defaults to: `[ 'http', 'https' ]`.

## Developing the package

### Preview

```
yarn install
yarn start
```

This will open http://localhost:8080/ sample page with the plugin enabled.

### Testing

```
yarn install
yarn test -w
```

## License

This package is available under [MIT license](https://opensource.org/licenses/MIT).
