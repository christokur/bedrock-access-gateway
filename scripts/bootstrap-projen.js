#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to show usage
function showUsage() {
    console.log('Usage: bootstrap-projen.js [--clean]');
    console.log('  --clean    Clean the project before bootstrapping');
    console.log('  Without --clean, only bootstrapping is performed');
    process.exit(1);
}

// Function to detect projenrc file type
function detectProjenrc() {
    if (fs.existsSync('.projenrc.ts')) {
        return 'ts';
    } else if (fs.existsSync('.projenrc.js')) {
        return 'js';
    }
    return 'none';
}

// Basic cleanup for when package.json doesn't exist
function basicCleanup() {
    const basicFiles = ['node_modules', 'package-lock.json', 'package.json'];
    basicFiles.forEach(file => {
        try {
            if (fs.existsSync(file)) {
                if (fs.lstatSync(file).isDirectory()) {
                    fs.rmSync(file, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(file);
                }
            }
        } catch (error) {
            console.error(`Error removing ${file}:`, error);
        }
    });
}

// Clean up function
function cleanup() {
    console.log('🧹 Cleaning project...');
    if (fs.existsSync('package.json')) {
        try {
            execSync('npm run clean', { stdio: 'inherit' });
        } catch (error) {
            console.error('Failed to run npm clean, falling back to basic cleanup:', error);
            basicCleanup();
        }
    } else {
        basicCleanup();
    }
}

// Bootstrap function
function bootstrap() {
    const projenrcType = detectProjenrc();

    switch (projenrcType) {
        case 'ts':
            console.log('📦 Bootstrapping TypeScript project...');
            execSync('npm install projen typescript ts-node @types/node && npx ts-node --transpileOnly .projenrc.ts', { stdio: 'inherit' });
            break;
        case 'js':
            console.log('📦 Bootstrapping JavaScript project...');
            execSync('npm install projen && npx projen', { stdio: 'inherit' });
            break;
        default:
            console.error('❌ Error: No .projenrc.ts or .projenrc.js found');
            process.exit(1);
    }
}

// Main function
function main() {
    // Parse arguments
    const args = process.argv.slice(2);
    let doClean = false;

    for (const arg of args) {
        switch (arg) {
            case '--clean':
                doClean = true;
                break;
            case '-h':
            case '--help':
                showUsage();
                break;
            default:
                console.error(`Unknown parameter: ${arg}`);
                showUsage();
        }
    }

    // If --clean was specified, clean first
    if (doClean) {
        cleanup();
    }

    // Always do the bootstrap
    bootstrap();
}

// Run main function
if (require.main === module) {
    main();
}
