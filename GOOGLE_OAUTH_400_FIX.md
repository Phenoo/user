# Fix for Google OAuth 400 Error

## The Error
```
400. That's an error.
The server cannot process the request because it is malformed. It should not be retried.
```

This error appears when clicking "Connect Google Account" and typically means there's a problem with your environment variables or Google OAuth configuration.

## Quick Diagnosis

### Step 1: Check Your Environment Variables

Visit this URL in your browser:
```
http://localhost:3000/api/google-meet/debug
```

This will show you:
- ✅ Which variables are set
- ⚠️ Any formatting issues
- ❌ Missing variables

### Step 2: Run the Test URL Generator

Visit this URL:
```
http://localhost:3000/api/google-meet/test-url
```

This will:
- Show the exact OAuth URL being generated
- Identify common issues
- Provide specific fixes

## Common Causes & Fixes

### 1. ❌ Client ID Format Issue

**Problem:** Your Client ID doesn't end with `.apps.googleusercontent.com`

**Check your `.env.local`:**
```bash
# ❌ WRONG - Missing the domain part
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789

# ✅ CORRECT - Should look like this
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
```

**How to fix:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID
3. Copy the FULL Client ID (should end with `.apps.googleusercontent.com`)
4. Update `.env.local` with the complete Client ID

---

### 2. ❌ Quotes in Environment Variables

**Problem:** Your `.env.local` has quotes around values

**Check your `.env.local`:**
```bash
# ❌ WRONG - Has quotes
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
NEXT_PUBLIC_GOOGLE_REDIRECT_URI="http://localhost:3000/api/google-meet/callback"

# ✅ CORRECT - No quotes
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-meet/callback
```

**How to fix:**
1. Open `.env.local`
2. Remove ALL quotes from variable values
3. Save the file
4. **RESTART your dev server** (`Ctrl+C` then `npm run dev`)

---

### 3. ❌ Redirect URI Mismatch

**Problem:** The redirect URI in your `.env.local` doesn't match Google Console

**Your `.env.local` should have:**
```bash
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-meet/callback
```

**Google Cloud Console should have the EXACT same URL:**
1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   http://localhost:3000/api/google-meet/callback
   ```
4. Click "SAVE"

**Important:**
- Must match EXACTLY (including `http://` vs `https://`)
- No trailing slashes
- Case-sensitive

---

### 4. ❌ Spaces or Extra Characters

**Problem:** Extra spaces or hidden characters in your environment variables

**How to check:**
```bash
# Open .env.local and make sure there are NO:
# - Spaces before or after the = sign
# - Spaces at the end of lines
# - Empty lines between variables (this is fine, but check for spaces)
```

**Example:**
```bash
# ❌ WRONG
NEXT_PUBLIC_GOOGLE_CLIENT_ID = your-id.apps.googleusercontent.com  
                              ^^^                                 ^^
                           Space here                        Space here

# ✅ CORRECT
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
```

---

### 5. ❌ Server Not Restarted

**Problem:** You changed `.env.local` but didn't restart the server

**How to fix:**
1. Stop your dev server (`Ctrl+C` or `Cmd+C`)
2. Start it again:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
3. Wait for it to fully start
4. Try connecting Google account again

---

## Complete Checklist

Use this checklist to verify everything:

- [ ] **Client ID ends with `.apps.googleusercontent.com`**
  - Visit `/api/google-meet/debug` to check
  
- [ ] **No quotes in `.env.local`**
  ```bash
  # Should look like:
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=123-abc.apps.googleusercontent.com
  # NOT:
  NEXT_PUBLIC_GOOGLE_CLIENT_ID="123-abc.apps.googleusercontent.com"
  ```

- [ ] **No extra spaces in `.env.local`**

- [ ] **Redirect URI matches Google Console EXACTLY**
  - `.env.local`: `http://localhost:3000/api/google-meet/callback`
  - Google Console: `http://localhost:3000/api/google-meet/callback`

- [ ] **All 4 environment variables are set:**
  ```bash
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-meet/callback
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```

- [ ] **Google Calendar API is enabled**
  - Go to [Google Cloud Console](https://console.cloud.google.com/apis/library)
  - Search for "Google Calendar API"
  - Click "ENABLE"

- [ ] **Dev server restarted after changing `.env.local`**

---

## Step-by-Step Fix

If you're still getting the error, follow these steps in order:

### 1. Check Environment Variables
```bash
# Visit this URL:
http://localhost:3000/api/google-meet/debug

# Look for warnings or errors
```

### 2. Get Correct Credentials from Google
```
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID (or create one if you don't have it)
3. Copy the full Client ID (ends with .apps.googleusercontent.com)
4. Copy the Client Secret
5. Under "Authorized redirect URIs", make sure you have:
   http://localhost:3000/api/google-meet/callback
6. Click SAVE
```

### 3. Update `.env.local`
```bash
# Create or edit .env.local in your project root
# Paste these variables (NO QUOTES):

NEXT_PUBLIC_GOOGLE_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-meet/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Restart Your Server
```bash
# Stop the server (Ctrl+C)
# Then start it again:
npm run dev
```

### 5. Test Again
```bash
1. Go to http://localhost:3000/dashboard
2. Find Google Meet Integration card
3. Click "Connect Google Account"
4. Should redirect to Google OAuth (NOT a 400 error)
```

---

## Test the Generated URL

If you want to see the exact URL being generated:

1. Visit: `http://localhost:3000/api/google-meet/test-url`
2. Copy the `generatedAuthUrl` from the response
3. Paste it directly in your browser
4. If it still shows 400, the issue is with the Client ID or Redirect URI in Google Console

---

## Still Having Issues?

1. **Check the terminal/console logs** when you click "Connect Google Account"
   - Look for the "Google OAuth Config Check" log
   - Look for the "Generated Auth URL" log

2. **Copy the generated URL** and inspect it:
   - Does the `client_id` parameter look correct?
   - Does the `redirect_uri` parameter match your Google Console?

3. **Try creating a NEW OAuth Client ID** in Google Console:
   - Sometimes the existing one gets corrupted
   - Create a fresh one and use those credentials

4. **Check Google Console Consent Screen**:
   - Go to: https://console.cloud.google.com/apis/credentials/consent
   - Make sure it's configured (even for testing)
   - Add your email as a test user if it's in "Testing" mode

---

## Example of Correct `.env.local`

```bash
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEf123456789
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-meet/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Make sure there are NO quotes, NO spaces before/after =, and the file is saved
```

---

**After fixing, you should see the Google OAuth consent screen instead of the 400 error!**



