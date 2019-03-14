const vscode = require("vscode");
const textile = require("textile-js");
const path = require("path");

var panels = {};

function updatePreview(document){
	if(!panels[document.fileName] || !document) return false;

	try{
		let output = textile(document.getText())
		panels[document.fileName].webview.html = `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset="utf-8">
			</head>
			<body>
				${output}
			</body>
		</html>
		`;
	}catch(e){
		console.error(e);
		vscode.window.showErrorMessage("An error occured while parsing this file, sorry!");
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.commands.registerCommand("textile.preview", function () {
		let editor = vscode.window.activeTextEditor;

		if(!editor){
			vscode.window.showErrorMessage("Please open a Textile file!");
			return false;
		}
		
		let filename = path.basename(editor.document.fileName);

		// Create a Webview panel for the preview
		panels[editor.document.fileName] = vscode.window.createWebviewPanel(
			"textilePreview",
			"Preview " + filename,
			vscode.ViewColumn.Two
		);

		// When the panel gets closed, remove it from the object
		panels[editor.document.fileName].onDidDispose(() => {
			delete panels[editor.document.fileName];
		});

		updatePreview(editor.document);
	});

	// Update the preview when the document is changed
	vscode.workspace.onDidChangeTextDocument((e) => {
		if(panels[e.document.fileName] && e.document == vscode.window.activeTextEditor.document){
			updatePreview(e.document);
		}
	});
	
	context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
