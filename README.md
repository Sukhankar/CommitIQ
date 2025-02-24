# CommitIQ README

CommitIQ is a VS Code extension designed to streamline API validation, environment variable tracking, and commit message linting. It enhances code quality, consistency, and adherence to best practices, making your development workflow more efficient.

## 🚀 Features

- **API Validation**
  - Validate API responses against defined contracts.
  - Receive instant feedback and error details within VS Code.

- **Environment Variable Tracker**
  - Track and validate required environment variables.
  - Identify missing or misconfigured variables.

- **Commit Message Linter**
  - Lint commit messages based on the Conventional Commits standard.
  - Highlight issues and offer auto-fix suggestions.
  - Supports multiline messages and breaking changes.

- **WebView Panel**
  - Interactive panel to trigger commands and view results.
  - Real-time feedback with status updates and error messages.


## 📋 Requirements

- Visual Studio Code (v1.60.0 or higher)
- Internet connection for API validation

## ⚙️ Extension Settings

This extension contributes the following settings:

- `commitiq.enable`: Enable/disable CommitIQ.
- `commitiq.defaultCommitType`: Set the default commit type for auto-fixes (default: `chore`).

## 🐞 Known Issues

- API validation may fail with unstable endpoints.
- Complex environment setups might require manual validation.

## 📖 Usage

1. **API Validation**
   - Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
   - Run `CommitIQ: Validate API`.

2. **Track Environment Variables**
   - Run `CommitIQ: Track Env Variables`.

3. **Lint Commit Messages**
   - Run `CommitIQ: Lint Commit Message`.

4. **Open WebView Panel**
   - Run `CommitIQ: Show Panel` for an interactive UI.

## 📦 Release Notes

### 1.0.0
- Initial release with API validation, environment tracking, and commit linting.

### 1.1.0
- Enhanced commit linter with auto-fix options.
- Improved WebView panel with dynamic feedback.

## 📚 Following Extension Guidelines

This extension follows [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines).

## 📖 Working with Markdown

- Split editor: `Ctrl+\` or `Cmd+\`
- Toggle preview: `Shift+Ctrl+V` or `Shift+Cmd+V`
- Markdown snippets: `Ctrl+Space`

## 💡 For More Information

- [VS Code API Documentation](https://code.visualstudio.com/api)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy coding with CommitIQ! 🚀**

