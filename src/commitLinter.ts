import * as vscode from 'vscode';

export async function lintCommitMessage(): Promise<{ success: boolean, message: string }> {
    const message = await vscode.window.showInputBox({
        prompt: 'Enter Commit Message',
        placeHolder: 'e.g., feat(login): add user authentication or fix(bug): resolve crash issue'
    });

    if (!message) {
        return { success: false, message: 'No commit message provided.' };
    }

    // Extended regex for Conventional Commits + multiline + breaking changes
    const validCommitRegex = /^(feat|fix|docs|style|refactor|test|chore|perf|build|ci|revert|hotfix|release)(\([\w\-.,]+\))?(!)?: .+/s;

    if (validCommitRegex.test(message)) {
        vscode.window.showInformationMessage("✅ Commit message follows Conventional Commits!");
        return { success: true, message: "Commit message is valid." };
    } else {
        const errorDetails = getCommitErrorDetails(message);
        vscode.window.showWarningMessage(`⚠️ Commit Issue: ${errorDetails}`);

        // Offer auto-fix or proceed
        const choice = await vscode.window.showQuickPick([
            `🔧 Fix to Conventional Commit format`,
            `✅ Proceed Anyway`
        ], { placeHolder: 'Choose an action:' });

        if (choice === '🔧 Fix to Conventional Commit format') {
            autoFixCommit(message);
            return { success: true, message: "Commit message auto-fixed." };
        } else if (choice === '✅ Proceed Anyway') {
            vscode.window.showInformationMessage("Commit processed without changes.");
            return { success: true, message: "Commit accepted without changes." };
        } else {
            return { success: false, message: "Commit was not processed." };
        }
    }
}

/**
 * Provides specific error details for invalid commit messages.
 */
function getCommitErrorDetails(message: string): string {
    if (!/^(feat|fix|docs|style|refactor|test|chore|perf|build|ci|revert|hotfix|release)/.test(message)) {
        return "Missing valid commit type (e.g., feat, fix, chore).";
    } else if (!/: /.test(message)) {
        return "Missing colon and space after type/scope (e.g., feat(login): ...).";
    } else if (message.trim().length < 10) {
        return "Commit message is too short. Provide a meaningful description.";
    }
    return "General format issue. Follow Conventional Commits.";
}

/**
 * Auto-fixes non-conventional commit messages.
 */
function autoFixCommit(message: string) {
    const defaultType = 'chore'; // Change as needed
    let fixedMessage = message.trim();

    // Add type if missing
    if (!/^(feat|fix|docs|style|refactor|test|chore|perf|build|ci|revert|hotfix|release)/.test(fixedMessage)) {
        fixedMessage = `${defaultType}: ${fixedMessage}`;
    }

    // Ensure colon and space after type/scope
    if (!/: /.test(fixedMessage)) {
        fixedMessage = fixedMessage.replace(/^(.*?)(\([\w\-]+\))?/, '$1$2: ');
    }

    vscode.window.showInformationMessage(`🔧 Fixed Commit Message: ${fixedMessage}`);

    // Copy to clipboard
    vscode.env.clipboard.writeText(fixedMessage);
    vscode.window.showInformationMessage("📋 Fixed message copied to clipboard.");
}
