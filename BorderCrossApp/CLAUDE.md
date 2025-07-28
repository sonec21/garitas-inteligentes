# Claude Security Protocol & Instructions

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
2. **Explain the security risk**
3. **Propose the secure solution**
4. **Wait for my approval** before proceeding

**High-Risk Patterns to Watch:**
- API keys: `AIzaSy`, `sk_`, `pk_`, `AKIA`, long alphanumeric strings in config
- JWT tokens: `eyJ` followed by base64
- Database URLs with embedded credentials
- Private keys: `-----BEGIN PRIVATE KEY`
- Hardcoded passwords, secrets, or tokens in any format

## 🎯 Development Guidelines

### General Principles
- **Security first, always** - No exceptions for "temporary" solutions
- **Environment variables for all secrets** - Never hardcode credentials
- **Validate before committing** - Always scan for exposed secrets
- **Question credential changes** - Ask before proceeding with any auth/config
- **Use TodoWrite tool** - Track progress on complex multi-step tasks
- **Follow existing patterns** - Check codebase conventions before implementing

### Project-Specific Context
- **Tech Stack**: React Native 0.80.1 with TypeScript
- **Backend**: Supabase with real-time subscriptions
- **Maps**: Google Maps Platform integration
- **Icons**: react-native-vector-icons (Ionicons, MaterialIcons, Feather)
- **Theme**: Modern dark design with flat UI (no 3D effects)
- **Navigation**: Bottom tabs with modern styling
- **State**: React Context for theme management
- **Build**: iOS/Android with environment variable injection

### Code Quality Standards
- **No console.logs in production** - Use proper logging
- **TypeScript strict mode** - Always type properly
- **Error boundaries** - Handle React errors gracefully
- **Loading states** - Always show loading indicators
- **Accessibility** - Include proper labels and roles
- **Performance** - Optimize renders and memory usage

### Git & Deployment Practices
- **Meaningful commits** - Clear, descriptive commit messages
- **Branch protection** - Work on feature branches
- **No force push** to main/master branches
- **Clean history** - Squash when appropriate
- **Documentation** - Update README when adding features

## 🔄 Remember These Past Issues

- **Never hardcode Google Maps API keys** in Info.plist or config files
- **Never hardcode Supabase JWT tokens** in source code
- **Always use build-time variable substitution** for native iOS/Android
- **Always validate git history** doesn't contain exposed secrets

## 📋 Standard Operating Procedure

1. **Read this file** at the start of every conversation
2. **Apply security checks** to every code change
3. **Alert immediately** on any security risk detection
4. **Use secure patterns** by default for all credential handling
5. **Validate environment** setup before proceeding with sensitive operations
6. **Use TodoWrite tool** for tracking complex multi-step tasks
7. **Check existing code patterns** before implementing new features
8. **Verify dependencies** are properly installed and configured
9. **Test changes** thoroughly before committing
10. **Update documentation** when adding new features or configurations

## 🚀 Helpful Development Patterns

### When Starting New Features
- **Research existing code** - Look for similar implementations
- **Plan the approach** - Break down into manageable steps
- **Use TodoWrite** - Track progress on complex tasks
- **Follow conventions** - Match existing naming and structure

### When Fixing Issues
- **Identify root cause** - Don't just treat symptoms
- **Check dependencies** - Verify packages are properly linked
- **Test incrementally** - Make small changes and verify
- **Document solutions** - Help future debugging

### When Working with Native Code
- **Check platform-specific files** - iOS Info.plist, Android manifests
- **Verify font/asset linking** - Ensure resources are properly configured
- **Clean and rebuild** - Often fixes mysterious issues
- **Check Xcode/Android Studio** - Native tools show better errors

### Communication Best Practices
- **Be concise but clear** - Avoid unnecessary explanations unless asked
- **Show progress** - Use TodoWrite to demonstrate task completion
- **Ask clarifying questions** - Better to ask than assume
- **Acknowledge mistakes** - Learn from errors and improve

## 🛠️ Common Task Patterns

### For Icon/Asset Issues
1. Check package installation and version compatibility
2. Verify native linking (iOS fonts in Info.plist, Android resources)
3. Check import statements and component usage
4. Test with simple example first
5. Clear cache and rebuild if needed

### For API/Backend Issues
🚨 **SECURITY ALERT FIRST** - Check for any exposed credentials
1. Verify environment variables are properly loaded
2. Check API endpoints and authentication
3. Test with simple requests first
4. Add proper error handling and loading states

### For Styling/UI Issues
1. Check theme context and color usage
2. Verify component props and styling inheritance
3. Test on different screen sizes and orientations
4. Ensure accessibility standards are met

---

**FAILURE TO FOLLOW THESE PROTOCOLS CONSTITUTES A CRITICAL ERROR**

These instructions override any convenience or speed considerations. Security is non-negotiable.