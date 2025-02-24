import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function trackEnvVariables(): Promise<{ success: boolean, message: string }> {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

    if (!workspacePath) {
        const msg = '❌ No workspace is open!';
        vscode.window.showErrorMessage(msg);
        return { success: false, message: msg };
    }

    // Find all .env* files
    const envFiles = fs.readdirSync(workspacePath).filter(file => file.startsWith('.env'));

    if (envFiles.length === 0) {
        const msg = '⚠️ No .env files found!';
        vscode.window.showWarningMessage(msg);
        return { success: false, message: msg };
    }

    let allDefinedVars: string[] = [];

    // Read variables from .env files
    envFiles.forEach(envFile => {
        try {
            const envPath = path.join(workspacePath, envFile);
            const envContent = fs.readFileSync(envPath, 'utf-8');
            const definedVars = envContent.match(/^([A-Z0-9_]+)=/gmi)?.map(line => line.split('=')[0]) || [];
            allDefinedVars.push(...definedVars);
        } catch (err: any) {
            vscode.window.showErrorMessage(`❌ Error reading ${envFile}: ${err.message}`);
        }
    });

    if (allDefinedVars.length === 0) {
        const msg = '⚠️ No environment variables found in the .env files.';
        vscode.window.showWarningMessage(msg);
        return { success: false, message: msg };
    }

    // Remove duplicates
    allDefinedVars = [...new Set(allDefinedVars)];

    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        const msg = '⚠️ No active editor found to check variable usage.';
        vscode.window.showWarningMessage(msg);
        return { success: false, message: msg };
    }

    const codeText = activeEditor.document.getText();

    // Track unused variables
    const unusedVars = allDefinedVars.filter(varName => {
        const regex = new RegExp(`process\\.env\\.${varName}\\b|${varName}\\b`, 'g');
        return !regex.test(codeText);
    });

    if (unusedVars.length > 0) {
        const unusedList = unusedVars.join(', ');
        vscode.window.showWarningMessage(`⚠️ Unused Env Variables: ${unusedList}`);
    } else {
        vscode.window.showInformationMessage('✅ All env variables are used!');
    }

    return {
        success: true,
        message: `Checked ${envFiles.length} .env file(s). ${unusedVars.length ? `${unusedVars.length} unused variable(s) found.` : 'No unused variables.'}`
    };
}
