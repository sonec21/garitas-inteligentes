# Claude Global Development Standards & Security Protocol

## 🚨 CRITICAL SECURITY PROTOCOL - ALWAYS FOLLOW

### IMMEDIATE SECURITY CHECKS - You MUST:

1. **Before ANY commit or code change involving credentials:**
   - **STOP and ALERT ME immediately** if you detect any API keys, tokens, or secrets
   - **REFUSE to proceed** until proper environment variable setup is confirmed
   - Scan for these patterns: `AIzaSy...`, `eyJ...`, `sk_`, `pk_`, `AKIA`, `-----BEGIN`

2. **Always use secure practices:**
   - Replace real credentials with `$(VARIABLE_NAME)` or `YOUR_API_KEY_HERE`
   - Set up proper environment variable injection FIRST
   - NEVER commit actual working credentials under any circumstances

3. **Pre-commit security validation:**
   - Check ALL files for credential patterns before staging
   - Verify `.gitignore` properly excludes sensitive files
   - Confirm environment variables are properly configured

### 🛡️ Security Validation Checklist

Before ANY code changes involving configuration, ask:
- [ ] Are there any hardcoded API keys or tokens?
- [ ] Are all secrets using environment variables?
- [ ] Is `.gitignore` properly configured?
- [ ] Are example/template files using placeholders?
- [ ] Will this commit expose any sensitive data?

### ⚠️ MANDATORY Alert System

If you detect ANY of these patterns, you MUST:
1. **STOP immediately** and alert me with: "🚨 SECURITY ALERT: [description]"
2. **Show the exact issue found** with file path and line numbers
3. **Display the problematic content** clearly (with sensitive parts masked if needed)
4. **Explain the security risk** and potential consequences
5. **Propose the secure solution** with specific implementation steps
6. **REQUIRE explicit user confirmation** before proceeding with ANY commit

### 📋 Issue Reporting Protocol

When I find ANY issue (security, code quality, or otherwise), I MUST:

#### 🔍 **Issue Detection Format:**
```
🚨 ISSUE DETECTED: [Type of Issue]

📍 Location: [file_path:line_number]
🔍 Found: [exact problematic content]
⚠️ Risk Level: [HIGH/MEDIUM/LOW]
💡 Issue: [clear explanation of the problem]
🛠️ Solution: [specific steps to fix]

❓ Do you want me to:
   A) Fix this issue now
   B) Skip and proceed anyway 
   C) Stop and let you handle it manually

WAITING FOR YOUR CONFIRMATION BEFORE PROCEEDING...
```

#### 🚨 **Security Issue Format:**
```
🚨 SECURITY ALERT: [Credential/Key Type] DETECTED

📍 Location: [file_path:line_number]
🔍 Found: [API_KEY_TYPE] starting with "[first_few_chars]..."
⚠️ Risk Level: HIGH - PUBLIC EXPOSURE RISK
💥 Consequence: This credential will be publicly visible in git history
🛠️ Required Action: Use environment variables instead

🛑 CANNOT PROCEED WITH COMMIT UNTIL RESOLVED

❓ Choose your action:
   A) Let me fix this with environment variables
   B) You'll handle this manually
   C) Cancel the operation

EXPLICIT CONFIRMATION REQUIRED TO CONTINUE...
```

**High-Risk Patterns to Watch:**
- API keys: `AIzaSy`, `sk_`, `pk_`, `AKIA`, long alphanumeric strings in config
- JWT tokens: `eyJ` followed by base64
- Database URLs with embedded credentials
- Private keys: `-----BEGIN PRIVATE KEY`
- Hardcoded passwords, secrets, or tokens in any format

## 🎯 Universal Development Guidelines

### General Principles (Apply to ALL projects)
- **Security first, always** - No exceptions for "temporary" solutions
- **Environment variables for all secrets** - Never hardcode credentials
- **Validate before committing** - Always scan for exposed secrets
- **Question credential changes** - Ask before proceeding with any auth/config
- **Use TodoWrite tool** - Track progress on complex multi-step tasks
- **Follow existing patterns** - Check codebase conventions before implementing

### Code Quality Standards (Universal)
- **No console.logs in production** - Use proper logging
- **Type safety** - Use TypeScript/proper typing when available
- **Error handling** - Handle errors gracefully
- **Loading states** - Always show loading indicators
- **Accessibility** - Include proper labels and roles
- **Performance** - Optimize renders and memory usage

### Git & Deployment Practices (Universal)
- **Meaningful commits** - Clear, descriptive commit messages
- **Branch protection** - Work on feature branches when possible
- **No force push** to main/master branches without explicit approval
- **Clean history** - Squash when appropriate
- **Documentation** - Update README when adding features

## 📋 Standard Operating Procedure (Every Project)

1. **Read project-specific CLAUDE.md** if it exists
2. **Apply security checks** to every code change
3. **Alert immediately** on any security risk detection
4. **Use secure patterns** by default for all credential handling
5. **Validate environment** setup before proceeding with sensitive operations
6. **Use TodoWrite tool** for tracking complex multi-step tasks
7. **Check existing code patterns** before implementing new features
8. **Verify dependencies** are properly installed and configured
9. **Test changes** thoroughly before committing
10. **Update documentation** when adding new features or configurations

## 🚀 Universal Development Patterns

### When Starting in Any New Project
- **Look for project-specific CLAUDE.md** first
- **Research existing code** - Look for similar implementations
- **Plan the approach** - Break down into manageable steps
- **Use TodoWrite** - Track progress on complex tasks
- **Follow conventions** - Match existing naming and structure

### When Fixing Issues (Any Language/Framework)
- **Identify root cause** - Don't just treat symptoms
- **Check dependencies** - Verify packages are properly installed
- **Test incrementally** - Make small changes and verify
- **Document solutions** - Help future debugging

### Communication Best Practices
- **Be concise but clear** - Avoid unnecessary explanations unless asked
- **Show progress** - Use TodoWrite to demonstrate task completion
- **Ask clarifying questions** - Better to ask than assume
- **Acknowledge mistakes** - Learn from errors and improve

## 📚 Documentation Standards (Universal)

### When Creating Documentation for Any Feature, Integration, or System Component:

**Required Format:**
- Use Confluence-friendly rich text format with standard markdown
- Follow the template structure: Overview, Architecture, Configuration, API Routes, Scripts, Services, Security, Examples, Maintenance
- Create files named: `{FEATURE_NAME}_DOCUMENTATION_CONFLUENCE.txt`
- Ensure copy-paste ready formatting for Atlassian Confluence

**Security Requirements:**
- **ALWAYS use placeholder values** for sensitive data (`your_api_key`, `example.com`, `user@example.com`)
- **NEVER expose real credentials**, API keys, passwords, or production URLs
- **Scan all code examples** for credentials before including
- **Replace real values** with clearly marked placeholders
- **Add security warnings** where configuration involves sensitive data
- **Never include** production URLs, database credentials, or personal data

**Documentation Security Checklist:**
- [ ] All API keys replaced with `YOUR_API_KEY_HERE` or similar placeholders
- [ ] All URLs use example domains (`example.com`, `your-domain.com`)
- [ ] All emails use example addresses (`user@example.com`)
- [ ] All database credentials use placeholders (`your_username`, `your_password`)
- [ ] Security warnings added for sensitive configuration steps
- [ ] Code examples contain no real production values

## 🛠️ Common Task Patterns (Framework Agnostic)

### For Dependency/Package Issues
1. Check package installation and version compatibility
2. Verify proper configuration files
3. Check import statements and usage
4. Test with simple example first
5. Clear cache and rebuild if needed

### For API/Backend Issues
🚨 **SECURITY ALERT FIRST** - Check for any exposed credentials
1. Verify environment variables are properly loaded
2. Check API endpoints and authentication
3. Test with simple requests first
4. Add proper error handling and loading states

### For Configuration Issues
🚨 **SECURITY ALERT FIRST** - Scan for hardcoded secrets
1. Check environment variable setup
2. Verify config file syntax and structure
3. Test with minimal configuration first
4. Ensure sensitive data is properly excluded from git

---

## 🏠 Project-Specific Instructions

**If a project has its own CLAUDE.md file, those instructions take precedence and supplement these global standards.**

---

**FAILURE TO FOLLOW THESE PROTOCOLS CONSTITUTES A CRITICAL ERROR**

These instructions override any convenience or speed considerations. Security is non-negotiable.