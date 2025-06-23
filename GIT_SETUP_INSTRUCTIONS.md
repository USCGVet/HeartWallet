# Git Setup Instructions for HeartWallet

Since you're using WSL, it's better to set up Git from Windows. Follow these steps:

## Option 1: Using Windows Command Prompt or PowerShell

1. Open Command Prompt or PowerShell as Administrator
2. Navigate to your project directory:
   ```
   cd C:\Heartwallet\heartwallet
   ```

3. Initialize git and connect to your repository:
   ```
   git init
   git remote add origin https://github.com/USCGVet/HeartWallet.git
   ```

4. Create a .gitignore file (already created for you)

5. Add all files and make your first commit:
   ```
   git add .
   git commit -m "Initial commit: HeartWallet Chrome Extension for PulseChain"
   ```

6. Push to GitHub:
   ```
   git branch -M main
   git push -u origin main
   ```

## Option 2: Using Git Bash (if installed)

1. Open Git Bash
2. Navigate to: `/c/Heartwallet/heartwallet`
3. Run the same commands as above

## Important Files to Exclude

I've created a .gitignore file that excludes:
- ethers.umd.min.js (large library file)
- Any sensitive data or private keys
- Debug files
- Archive folder (contains duplicates)

## After Setup

Once connected, you can use either Windows tools or WSL for future git operations.