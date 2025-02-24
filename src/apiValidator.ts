import * as vscode from 'vscode';
import SwaggerParser from '@apidevtools/swagger-parser';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import axios from 'axios';

export async function validateAPI() {
    const swaggerPath = await selectAPIFile();
    if (!swaggerPath) {
        vscode.window.showErrorMessage('No API file selected.');
        return { success: false, message: 'No API file selected.' };
        
    }

    try {
        const apiContent = await loadAPIContent(swaggerPath);
        const parsedAPI = parseAPI(apiContent, swaggerPath);

        checkAPIVersion(parsedAPI);

        // Bundle external references before validation
        const bundledAPI = await SwaggerParser.bundle(apiContent);

        await SwaggerParser.validate(bundledAPI);
        vscode.window.showInformationMessage('✅ API Contract is valid!');
        return { success: true, message: 'API validated successfully!' };
    } catch (err: any) {
        const detailedError = err.details ? JSON.stringify(err.details, null, 2) : err.message;
        vscode.window.showErrorMessage(`❌ API Validation Error:\n${detailedError}`);
        suggestFix(err.message);
        return { success: false, message: err.message || 'API validation failed.' };
    }
}

/**
 * Allow user to select API file or input a URL.
 */
async function selectAPIFile(): Promise<string | undefined> {
    const options = ['📁 Select Local File', '🌐 Validate via URL'];
    const choice = await vscode.window.showQuickPick(options, { placeHolder: 'Choose API source' });

    if (choice === '📁 Select Local File') {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: { 'API Files': ['json', 'yaml', 'yml'] }
        });
        return fileUri?.[0]?.fsPath;
    } else if (choice === '🌐 Validate via URL') {
        return await vscode.window.showInputBox({ prompt: 'Enter API Spec URL' });
    }
}

/**
 * Load API content from local file or remote URL.
 */
async function loadAPIContent(pathOrUrl: string): Promise<string> {
    if (/^https?:\/\//.test(pathOrUrl)) {
        try {
            const response = await axios.get(pathOrUrl, { timeout: 10000 }); // 10s timeout
            if (response.status !== 200) {
                throw new Error(`Failed to fetch API: HTTP ${response.status}`);
            }
            return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        } catch (err: any) {
            throw new Error(`Network Error: ${err.message}`);
        }
    } else if (fs.existsSync(pathOrUrl)) {
        return fs.readFileSync(pathOrUrl, 'utf-8');
    } else {
        throw new Error('API file not found or URL unreachable.');
    }
}

/**
 * Parse JSON or YAML API content.
 */
function parseAPI(content: string, path: string): object {
    try {
        if (path.endsWith('.yaml') || path.endsWith('.yml')) {
            return yaml.load(content) as object;
        }
        return JSON.parse(content);
    } catch (err: any) {
        throw new Error(`Parsing Error: ${err.message}`);
    }
}

/**
 * Check API version compatibility.
 */
function checkAPIVersion(api: any) {
    const supportedVersions = ['2.0', '3.0.0', '3.1.0'];
    const version = api.swagger || api.openapi;
    if (!version) {
        vscode.window.showWarningMessage('⚠️ API version not specified in the spec.');
        return;
    }
    if (!supportedVersions.includes(version)) {
        vscode.window.showWarningMessage(`⚠️ API version ${version} is not fully supported. Consider using OpenAPI 3.0.0 or 3.1.0.`);
    }
}

/**
 * Suggest fixes based on common API issues.
 */
function suggestFix(errorMsg: string) {
    const fixes = [
        { keyword: 'missing', fix: 'Check required fields in your API spec.' },
        { keyword: 'invalid type', fix: 'Ensure correct data types for properties.' },
        { keyword: 'unsupported', fix: 'Verify OpenAPI/Swagger version compatibility.' },
        { keyword: 'circular $ref', fix: 'Remove or fix circular references in $ref paths.' },
        { keyword: 'syntax', fix: 'Validate JSON/YAML formatting.' },
        { keyword: 'timeout', fix: 'Check network connection or increase timeout for large specs.' }
    ];

    const match = fixes.find(fix => errorMsg.toLowerCase().includes(fix.keyword));
    if (match) {
        vscode.window.showInformationMessage(`💡 Suggested Fix: ${match.fix}`);
    } else {
        vscode.window.showInformationMessage('💡 Consider reviewing the API spec for potential issues.');
    }
}
