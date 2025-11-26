# Google Meet Integration - Test Checklist ✅

Use this checklist to verify the Google Meet integration is working correctly.

## Pre-Flight Checks

### 1. Environment Variables ✓
Check that these are set in `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-meet/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**How to verify:**
```bash
# Visit this URL in your browser:
http://localhost:3000/api/google-meet/debug
```

**Expected result:**
```json
{
  "environment": {
    "hasClientId": true,
    "hasClientSecret": true,
    "hasRedirectUri": true,
    "hasAppUrl": true
  }
}
```

### 2. Google Cloud Console Setup ✓

Go to [Google Cloud Console](https://console.cloud.google.com/):

- [ ] Google Calendar API is **enabled**
- [ ] OAuth 2.0 Client ID is created
- [ ] Authorized redirect URIs include: `http://localhost:3000/api/google-meet/callback`
- [ ] OAuth consent screen is configured

**Scopes that should be requested (automatically set in code):**
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/calendar.events`

### 3. Server Running ✓
```bash
npm run dev
# or
yarn dev
```

Expected: Server running on `http://localhost:3000`

---

## Test Sequence

### Test 1: Auth URL Generation ✓

**Steps:**
1. Go to `/dashboard`
2. Find "Google Meet Integration" card
3. Check status badge shows "Setup Required" (yellow)

**Expected:**
- Card is visible
- "Connect Google Account" button is visible
- No error messages

---

### Test 2: OAuth Connection ✓

**Steps:**
1. Click "Connect Google Account"
2. New popup window opens
3. Google OAuth consent screen appears
4. Select your Google account
5. Review permissions (Calendar access)
6. Click "Allow"

**Expected:**
- Popup closes automatically
- Dashboard updates to show "Connected" (green badge)
- "Disconnect" button appears
- No error alerts

**If it fails:**
- Check browser console for errors
- Check redirect URI in Google Console
- Verify environment variables are loaded

---

### Test 3: Token Persistence ✓

**Steps:**
1. After connecting (Test 2), refresh the page (`Cmd/Ctrl + R`)

**Expected:**
- Status still shows "Connected" (green)
- Token persists across refresh
- You don't need to reconnect

---

### Test 4: Create Meeting ✓

**Steps:**
1. In "Create Google Meet" section, fill in:
   - **Meeting Title:** "Test Meeting"
   - **Description:** "This is a test" (optional)
   - **Attendees:** Leave empty or add test email
   - **Start Time:** Use default (1 hour from now)
   - **End Time:** Use default (2 hours from now)
2. Click "Create Google Meet"

**Expected:**
- Success toast: "Google Meet created successfully! Meeting code: xxx-xxxx-xxx"
- New tab opens with Google Meet link
- Form resets to empty
- Meeting appears in Google Calendar

**What to verify in Google Calendar:**
- Event exists with correct title and time
- Event has a Google Meet link (video camera icon)
- Clicking the link opens Google Meet

---

### Test 5: Meeting Link Validation ✓

**Steps:**
1. Open Google Calendar (calendar.google.com)
2. Find the test meeting you created
3. Click on the event
4. Click the Google Meet link

**Expected:**
- Google Meet room opens
- Meeting code matches the one in success message
- You can join the meeting

---

### Test 6: Error Handling ✓

**Test 6a: Empty Form**
1. Leave all fields empty
2. Click "Create Google Meet"

**Expected:** Toast error: "Please fill in all required fields"

**Test 6b: Invalid Dates**
1. Set End Time before Start Time
2. Click "Create Google Meet"

**Expected:** Browser validation error or Google API error

---

### Test 7: Disconnect ✓

**Steps:**
1. While connected, click "Disconnect" button
2. Confirm the action

**Expected:**
- Status changes to "Setup Required" (yellow)
- Success toast: "Google account disconnected"
- "Connect Google Account" button reappears
- Token cleared from sessionStorage

---

### Test 8: Reconnection ✓

**Steps:**
1. After disconnecting (Test 7), click "Connect Google Account" again
2. Authorize again

**Expected:**
- Reconnection succeeds
- Can create meetings again

---

## Troubleshooting

### Issue: "Google OAuth setup error"
**Check:**
1. Environment variables are set correctly
2. Restart dev server after setting environment variables
3. Visit `/api/google-meet/debug` to verify configuration

### Issue: Popup blocked
**Solution:**
1. Allow popups for localhost in browser settings
2. Try clicking the button again

### Issue: "Invalid redirect URI"
**Check:**
1. Google Console redirect URI: `http://localhost:3000/api/google-meet/callback`
2. `.env.local` redirect URI matches exactly
3. No trailing slashes

### Issue: Meeting created but no Google Meet link
**Check:**
1. Google Calendar API is enabled in Google Cloud Console
2. OAuth scopes are correct (check code in `lib/google-meet.ts`)
3. Re-authorize the application to get new scopes

### Issue: "Failed to create meeting"
**Check:**
1. Access token is still valid (tokens expire after ~1 hour)
2. Reconnect if needed
3. Check browser console for detailed error messages
4. Verify Google Calendar API quota isn't exceeded

### Issue: Token lost after refresh
**Check:**
1. This should be fixed! If it still happens, check browser console for errors
2. Make sure sessionStorage is enabled in browser

---

## Success Criteria ✅

All tests should pass:
- [x] Can connect Google account
- [x] Token persists across page refresh
- [x] Can create meetings with Google Meet links
- [x] Meetings appear in Google Calendar
- [x] Google Meet links work
- [x] Can disconnect and reconnect
- [x] Error handling works correctly

---

## Production Deployment Checklist

Before deploying to production:

1. **Update Environment Variables:**
   ```bash
   NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google-meet/callback
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

2. **Update Google Cloud Console:**
   - Add production redirect URI to authorized redirect URIs
   - Keep localhost for development

3. **Test on Production:**
   - Run all tests again on production URL
   - Verify SSL certificate is valid
   - Test OAuth flow on production

4. **Monitor:**
   - Check Google Cloud Console for API usage
   - Monitor error logs
   - Set up alerts for API quota limits

---

## Quick Reference

**Key Files:**
- Auth: `/app/api/google-meet/auth/route.ts`
- Callback: `/app/api/google-meet/callback/route.ts`
- Create: `/app/api/google-meet/create/route.ts`
- Service: `/lib/google-meet.ts`
- Component: `/components/google-meeting-integration.tsx`

**Key Endpoints:**
- Auth URL: `GET /api/google-meet/auth`
- Callback: `GET /api/google-meet/callback`
- Create Meeting: `POST /api/google-meet/create`
- Debug: `GET /api/google-meet/debug`

**Documentation:**
- Setup: `GOOGLE_MEET_SETUP.md`
- Fix Summary: `GOOGLE_MEET_FIX_SUMMARY.md`
- This Checklist: `GOOGLE_MEET_TEST_CHECKLIST.md`

---

**Last Updated:** November 11, 2025
**Status:** Ready for Testing ✅



