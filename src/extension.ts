import * as vscode from 'vscode';
import { search } from './utils/search';
import { matchSearchPhrase } from './utils/matchSearchPhrase';
import { updateStatusBarMessage, statusBarMessage } from './utils/statusBarMessage';

export function activate(_: vscode.ExtensionContext) {
  //updateStatusBarMessage('codeStackAI: Active');

  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems: async (document, position, token, context) => {
      console.log("Checking for completion items...");
      const textBeforeCursor = document.getText(
        new vscode.Range(position.with(undefined, 0), position)
      );
      const match = matchSearchPhrase(textBeforeCursor);
      console.log("Match result:", match);

      let items: vscode.CompletionItem[] = [];
      if (match) {
        let rs;
        try {
          statusBarMessage.text = 'codeStackAI: Generating code...';
          rs = await search(match.searchPhrase);
          if (rs) {
            items = rs.results.map((item) => {
              const output = `${match.commentSyntax} Source: ${item.sourceURL} ${match.commentSyntaxEnd}\n${item.code}`;
              const completionItem = new vscode.CompletionItem(output, vscode.CompletionItemKind.Snippet);
              completionItem.filterText = match.searchPhrase;
              completionItem.detail = item.sourceURL;
              completionItem.documentation = new vscode.MarkdownString(item.code);
              // Define the snippet
              completionItem.insertText = new vscode.SnippetString(item.code);
              completionItem.range = new vscode.Range(
                position.translate(0, -match.searchPhrase.length),
                position
              );
              return completionItem;
            });
          }
        } catch (err: any) {
          vscode.window.showErrorMessage(err.toString());
        } finally {
          statusBarMessage.text = 'codeStackAI: Active';
        }
      }
      return {items};
    }
  };
   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const disposable = vscode.languages.registerCompletionItemProvider({ pattern: "**" }, provider);

    // Agrega el disposable al contexto de la extensión
    _.subscriptions.push(disposable);
  //vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, provider);

  const openSettingsCommand = vscode.commands.registerCommand('codeStackAI.openSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', '@ext:codeStackAI.captain-stack');
  });

  const statusBarSettings = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarSettings.command = 'codeStackAI.openSettings';
  statusBarSettings.text = '$(gear) codeStackAI';
  statusBarSettings.tooltip = 'Open codeStackAI Settings';
  statusBarSettings.show();

  _.subscriptions.push(openSettingsCommand, statusBarSettings, statusBarMessage);
}
