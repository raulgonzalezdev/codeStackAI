import { OpenAIApiClient } from './openai-client';
import * as vscode from 'vscode';

const openaiClient = new OpenAIApiClient();

export async function search(searchPhrase: string) {
  try {
    const response = await openaiClient.generateCode(searchPhrase);
    
    if (response && response.choices && response.choices.length > 0) {
      const code = response.choices[0].message.content.trim();
      
      vscode.window.setStatusBarMessage(`codeStackAI: loading results`, 2000);
      return { results: [{ sourceURL: 'codeStackAI', code }] };
    }
  } catch (error: any) {
    throw new Error(`Error searching with ChatGPT: ${error.message}`);
  }
  vscode.window.setStatusBarMessage(`codeStackAI: Start loading snippet results...`, 2000);
}
