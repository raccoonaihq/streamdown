# Installing Streamdown from GitHub

This document explains how to install and use the Streamdown package directly from this GitHub repository in your other projects.

## Installation Methods

### Method 1: Using the dist Branch (Recommended)

The `dist` branch contains pre-built files that are automatically updated on every push to `main`. This is the fastest and most reliable method.

Add to your `package.json`:

```json
{
  "dependencies": {
    "streamdown": "github:raccoonaihq/streamdown#dist"
  }
}
```

Then run:

```bash
pnpm install
# or
npm install
# or
yarn install
```

### Method 2: Using a Specific Version Tag

To use a specific version, reference a git tag:

```json
{
  "dependencies": {
    "streamdown": "github:raccoonaihq/streamdown#v1.4.0"
  }
}
```

**Note:** Make sure the tag has been pushed and the dist branch has been updated via GitHub Actions.

### Method 3: Using the Main Branch

To always use the latest version from the main branch:

```json
{
  "dependencies": {
    "streamdown": "github:raccoonaihq/streamdown#dist"
  }
}
```

### Method 4: Using a Specific Commit

To lock to a specific commit:

```json
{
  "dependencies": {
    "streamdown": "github:raccoonaihq/streamdown#<commit-sha>"
  }
}
```

## How It Works

1. **GitHub Actions Automation**: When you push to `main` or create a tag, GitHub Actions:

   - Installs dependencies
   - Runs tests to ensure code quality
   - Builds the package
   - Verifies build output
   - Flattens the dist directory structure (files moved to root)
   - Updates package.json paths to match the flattened structure
   - Creates/updates the `dist` branch with built files at the root level

2. **Package Manager Installation**: When you install from GitHub:
   - The package manager clones the specified branch/tag
   - Uses the pre-built files directly (no `dist/` subdirectory)
   - No build step required on the consumer side
   - All dependencies are automatically installed

## Key Improvements (Best Practices)

✅ **Automated Testing**: Tests run before building to catch issues early  
✅ **Build Verification**: Ensures all expected files are generated  
✅ **Flattened Structure**: Built files at root level (not in `dist/` folder)  
✅ **Path Correction**: package.json paths automatically adjusted for distribution  
✅ **Clean Branch**: Uses orphan branch strategy for a clean dist branch  
✅ **Atomic Updates**: Only pushes if there are actual changes  
✅ **Commit Traceability**: Each dist commit references the source commit

## Publishing Updates

When you make changes to the package:

1. Make your changes and commit them:

   ```bash
   git add .
   git commit -m "Your changes"
   ```

2. Push to main:

   ```bash
   git push origin main
   ```

3. GitHub Actions will automatically:

   - Build the package
   - Update the `dist` branch

4. In your consuming project, update the dependency:
   ```bash
   pnpm update streamdown
   # or
   npm update streamdown
   ```

## Creating Releases

To create a versioned release:

1. Create and push a tag:

   ```bash
   git tag v1.4.1
   git push origin v1.4.1
   ```

2. GitHub Actions will create a release with the built files

3. Reference the specific version in your projects:
   ```json
   {
     "dependencies": {
       "streamdown": "github:raccoonaihq/streamdown#v1.4.1"
     }
   }
   ```

## Troubleshooting

### "Cannot find module" errors

Make sure you're using the `dist` branch or a version that has been built by GitHub Actions:

```json
"streamdown": "github:raccoonaihq/streamdown#dist"
```

### Outdated version after update

Clear your package manager cache:

```bash
# pnpm
pnpm store prune

# npm
npm cache clean --force

# yarn
yarn cache clean
```

Then reinstall:

```bash
pnpm install --force
```

### Build errors in consuming project

The `dist` branch contains pre-built files, so you shouldn't need to build anything. If you're getting build errors, make sure:

1. You're referencing the `dist` branch
2. Your package manager successfully downloaded the package
3. All peer dependencies are installed (React, etc.)

## Additional Resources

- [Main Repository](https://github.com/raccoonaihq/streamdown)
- [Documentation](https://streamdown.ai)
- [NPM Package](https://www.npmjs.com/package/streamdown) (if published)
