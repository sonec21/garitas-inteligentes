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

### Project-Specific Context
- React Native app with Google Maps integration
- Supabase backend with API keys
- iOS/Android native configuration
- Environment variables managed through `.env` file

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

---

**FAILURE TO FOLLOW THESE PROTOCOLS CONSTITUTES A CRITICAL ERROR**

These instructions override any convenience or speed considerations. Security is non-negotiable.