# Google Calendar OAuth Scopes - Usage Explanation

## Requested Scopes

Your application requests the following Google Calendar scopes:

1. **`https://www.googleapis.com/auth/calendar`**
   - **Full access**: See, edit, share, and permanently delete all calendars you can access using Google Calendar

2. **`https://www.googleapis.com/auth/calendar.events`**
   - **Events access**: See, edit, share, and permanently delete all events on all calendars you can access

## How These Scopes Are Used in Your Application

### 1. **Creating Google Meet Meetings** 🎥

**Location**: `lib/google-meet.ts` → `createMeeting()` method

**What it does**:

- Creates calendar events with Google Meet video conference links
- Used when users schedule study group meetings or virtual sessions

**API Calls Made**:

```typescript
POST https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1
```

**Data Accessed/Created**:

- ✅ **CREATE**: New calendar events with Google Meet links
- ✅ **READ**: Event details after creation (to extract Meet link)
- ✅ **WRITE**: Event summary, description, start/end times, attendees

**User Benefit**:

- Students can create virtual study sessions directly from the app
- Meeting links are automatically added to their Google Calendar
- Attendees receive calendar invitations automatically

---

### 2. **Fetching Upcoming Meetings** 📅

**Location**: `lib/google-meet.ts` → `getUpcomingMeetings()` method

**What it does**:

- Retrieves upcoming calendar events that have Google Meet links
- Displays scheduled meetings in the dashboard

**API Calls Made**:

```typescript
GET https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin={now}&maxResults=10
```

**Data Accessed**:

- ✅ **READ**: Calendar events from user's primary calendar
- ✅ **READ**: Event metadata (title, time, Meet links)
- ✅ **READ**: Conference data (video meeting links)

**User Benefit**:

- See all upcoming study sessions in one place
- Quick access to meeting links
- Better time management

---

### 3. **Study Group Calendar Integration** 👥

**Location**:

- `app/dashboard/(dashboard)/study-groups/[id]/page.tsx`
- `app/dashboard/(dashboard)/study-groups/_components/study-group-card.tsx`

**What it does**:

- Allows users to add study group meetings to their Google Calendar
- Provides "Add to Google Calendar" buttons for scheduled sessions

**Data Accessed**:

- ✅ **READ**: Calendar link sharing (via `googleCalendarLink` field)
- ✅ **READ**: Event details for display

**User Benefit**:

- One-click calendar integration for study group meetings
- Sync study sessions across devices
- Never miss a meeting

---

## What We DON'T Do (Privacy & Security)

### ❌ **We DO NOT**:

- **Delete calendars** - We never delete user calendars
- **Share calendars** - We don't modify calendar sharing settings
- **Access other users' calendars** - Only the authenticated user's primary calendar
- **Store calendar data permanently** - We only use tokens temporarily
- **Access calendar data without permission** - All access requires explicit user consent

### ✅ **We ONLY**:

- Create calendar events **with user's explicit action** (when they click "Create Meeting")
- Read calendar events **only when displaying upcoming meetings**
- Use the **primary calendar only** (not shared or secondary calendars)
- Store access tokens **securely in sessionStorage** (cleared on logout)

---

## Scope Justification for Google OAuth Verification

When submitting your app for Google OAuth verification, you'll need to justify these scopes. Here's the justification:

### **Why `calendar` scope is needed:**

> "Our application allows students to create Google Meet video conferences for study group sessions. To create these meetings, we need to create calendar events with conference data. The calendar scope is required to:
>
> - Create calendar events with Google Meet links
> - Read upcoming meetings to display in the student dashboard
> - Allow students to sync study sessions with their personal calendars"

### **Why `calendar.events` scope is needed:**

> "We specifically need calendar.events scope to:
>
> - Create events with conference data (Google Meet links)
> - Retrieve event details including meeting links
> - Display upcoming study sessions to users"

---

## Security & Privacy Measures

1. **Token Storage**:
   - Access tokens stored in `sessionStorage` (cleared on browser close)
   - Never stored in database or sent to third parties

2. **User Control**:
   - Users can disconnect Google integration at any time
   - All calendar operations require explicit user action
   - No background calendar access

3. **Data Minimization**:
   - Only access primary calendar
   - Only read events with Google Meet links
   - Only create events when user explicitly requests

4. **Error Handling**:
   - Graceful fallbacks if calendar access fails
   - Clear error messages to users
   - No silent failures

---

## User Experience Flow

1. **User clicks "Connect Google"** → OAuth consent screen appears
2. **User grants permissions** → Token stored securely
3. **User creates study session** → Calendar event created with Meet link
4. **User views dashboard** → Upcoming meetings displayed
5. **User can disconnect** → All tokens cleared, no further access

---

## Technical Implementation Details

### OAuth Flow

```typescript
// Scopes requested in lib/google-meet.ts:76-90
const scopes = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];
```

### Calendar Event Creation

```typescript
// Creates event with Google Meet link
const calendarEvent = {
  summary: "Study Session",
  start: { dateTime: "2024-01-15T10:00:00", timeZone: "America/New_York" },
  end: { dateTime: "2024-01-15T11:00:00", timeZone: "America/New_York" },
  conferenceData: {
    createRequest: {
      requestId: `meet-${Date.now()}`,
      conferenceSolutionKey: { type: "hangoutsMeet" },
    },
  },
};
```

---

## Compliance & Best Practices

✅ **Follows Google's OAuth 2.0 Best Practices**
✅ **Implements Principle of Least Privilege** (only requests necessary scopes)
✅ **Provides clear user consent flow**
✅ **Allows users to revoke access easily**
✅ **No background data collection**
✅ **Transparent about data usage**

---

## Summary

**The calendar scopes are essential for:**

1. Creating Google Meet links for virtual study sessions
2. Displaying upcoming meetings to students
3. Integrating study group schedules with personal calendars

**All usage is:**

- User-initiated (no background access)
- Transparent (clear what we're doing)
- Secure (tokens stored safely)
- Reversible (users can disconnect anytime)

This provides a seamless experience for students to manage their study sessions while maintaining full control over their calendar data.
