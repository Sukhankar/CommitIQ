import * as vscode from 'vscode';
import { validateAPI } from './apiValidator';
import { trackEnvVariables } from './envTracker';
import { lintCommitMessage } from './commitLinter';

export function activate(context: vscode.ExtensionContext) {
    // Register Validate API Command
    let apiDisposable = vscode.commands.registerCommand('extension.validateAPI', async () => {
        try {
            const result = await validateAPI();
            sendFeedback('API Validation', result.success, result.message);
        } catch (err: any) {
            sendFeedback('API Validation', false, err.message);
        }
    });
    context.subscriptions.push(apiDisposable);

    // Register Track Environment Variables Command
    let envDisposable = vscode.commands.registerCommand('extension.trackEnv', async () => {
        try {
            const result = await trackEnvVariables();
            sendFeedback('Env Tracking', result.success, result.message);
        } catch (err: any) {
            sendFeedback('Env Tracking', false, err.message);
        }
    });
    context.subscriptions.push(envDisposable);

    // Register Lint Commit Message Command
    let commitDisposable = vscode.commands.registerCommand('extension.lintCommit', async () => {
        try {
            const result = await lintCommitMessage();
            sendFeedback('Commit Linting', result.success, result.message);
        } catch (err: any) {
            sendFeedback('Commit Linting', false, err.message);
        }
    });
    context.subscriptions.push(commitDisposable);

    // WebView Panel Command
    let panelCommand = vscode.commands.registerCommand('api-code-validation-toolkit.showPanel', () => {
        const panel = vscode.window.createWebviewPanel(
            'apiCodeValidation',
            'API Code Validation Toolkit',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = getWebviewContent();

        // Handle Messages from WebView
        panel.webview.onDidReceiveMessage(
            async (message) => {
                try {
                    panel.webview.postMessage({ status: 'loading', command: message.command });
                    switch (message.command) {
                        case 'trackEnv':
                            await vscode.commands.executeCommand('extension.trackEnv');
                            break;
                        case 'validateAPI':
                            await vscode.commands.executeCommand('extension.validateAPI');
                            break;
                        case 'lintCommit':
                            await vscode.commands.executeCommand('extension.lintCommit');
                            break;
                        default:
                            panel.webview.postMessage({ error: `Unknown command: ${message.command}` });
                    }
                } catch (err: any) {
                    panel.webview.postMessage({ error: err.message });
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(panelCommand);

    // Function to Send Feedback to WebView & Show VSCode Notification
    function sendFeedback(title: string, success: boolean, message: string) {
        const feedback = { title, success, message };
        vscode.window.showInformationMessage(`${title}: ${message}`);
        vscode.commands.executeCommand('api-code-validation-toolkit.showPanel').then(() => {
            vscode.commands.executeCommand('vscode.postMessage', feedback);
        });
    }
}

export function deactivate() {}

/**
 * WebView Content with Dynamic Feedback & Modernized UI
 */
function getWebviewContent(): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>API Code Validation Toolkit</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; background-color: #1e1e1e; color: #ffffff; }
                h1 { text-align: center; margin-bottom: 20px; }
                .button-container { display: flex; justify-content: center; gap: 15px; margin-bottom: 20px; }
                button {
                    background-color: #007acc;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
                button:hover { background-color: #005fa3; }
                .status { text-align: center; margin-top: 20px; }
                .success { color: #4CAF50; }
                .error { color: #f14c4c; }
                .warning { color: #f39c12; }
                .loading { color: #3498db; }
            </style>
        </head>
        <body>
            <h1>API Code Validation Toolkit</h1>
            <div class="button-container">
                <button onclick="sendCommand('trackEnv')">Track Env Variables</button>
                <button onclick="sendCommand('validateAPI')">Validate API Contract</button>
                <button onclick="sendCommand('lintCommit')">Lint Commit Message</button>
            </div>
            <div class="status" id="status"></div>

            <script>
                const vscode = acquireVsCodeApi();

                function sendCommand(command) {
                    vscode.postMessage({ command });
                    setStatus('Running ' + command + '...', 'loading');
                }

                function setStatus(message, type) {
                    const statusDiv = document.getElementById('status');
                    statusDiv.className = type;
                    statusDiv.innerText = message;
                }

                window.addEventListener('message', event => {
                    const { title, success, message, status, error, command } = event.data;

                    if (status === 'loading') {
                        setStatus('⚡ ' + command + ' in progress...', 'loading');
                    } else if (success) {
                        setStatus('✅ ' + title + ': ' + message, 'success');
                    } else if (error) {
                        setStatus('❌ Error: ' + error, 'error');
                    } else {
                        setStatus('⚠️ ' + title + ': ' + message, 'warning');
                    }
                });
            </script>
        </body>
        </html>
    `;
}
