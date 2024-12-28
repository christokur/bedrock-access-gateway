const fs = require('fs');
const path = require('path');
const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE || '.';

// Get the project root directory
const projectRoot = path.resolve(GITHUB_WORKSPACE);

// Read the VERSION file
let version;
try {
  const versionFilePath = path.join(projectRoot, 'VERSION');
  version = fs.readFileSync(versionFilePath, 'utf8').trim();
} catch (error) {
  console.error('Error reading VERSION file:', error);
  process.exit(1);
}

// Read the package.json file
const packageJsonPath = path.join(projectRoot, 'package.json');
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error('Error reading package.json:', error);
  process.exit(1);
}

// Update the version in package.json
packageJson.version = version;

// Write the updated package.json back to the file
try {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`Updated package.json version to ${version}`);
} catch (error) {
  console.error('Error writing package.json:', error);
  process.exit(1);
}