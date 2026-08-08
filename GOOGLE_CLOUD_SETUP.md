# Google Cloud Setup & OAuth Configuration Guide — StudentApp

This document provides exact instructions for configuring your **Google Cloud Console Project** to support StudentApp's least-privilege incremental OAuth authentication and academic integrations.

---

## 1. Google Cloud Project Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `StudentApp Academic OS`.
3. Note down your **Project Number** (found in Project Info dashboard).

---

## 2. Enable Google APIs
In your Google Cloud Console project, navigate to **APIs & Services > Library** and enable the following 4 APIs:
- **Google Classroom API**
- **Google Drive API**
- **Google Calendar API**
- **Google Picker API**

---

## 3. OAuth Consent Screen Configuration
Navigate to **APIs & Services > OAuth Consent Screen**:
1. Select **External** User Type (or Internal for Workspace domain testing).
2. App Name: `StudentApp`
3. User Support Email: your developer email.
4. Developer Contact Email: your developer email.

### Data Access Scopes
Click **Add or Remove Scopes** and add strictly the following 8 scopes:

#### IDENTITY (Authentication)
- `openid`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

#### GOOGLE CLASSROOM (Read-only Course Import)
- `https://www.googleapis.com/auth/classroom.courses.readonly` (View classes)
- `https://www.googleapis.com/auth/classroom.coursework.me.readonly` (View coursework & deadlines)
- `https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly` (View classwork materials)

#### GOOGLE DRIVE (Selective File Picker)
- `https://www.googleapis.com/auth/drive.file` (View and manage Google Drive files chosen with Google Picker)

#### GOOGLE CALENDAR (Owned Events)
- `https://www.googleapis.com/auth/calendar.events.owned` (View and edit events on owned calendars)

---

## 4. OAuth 2.0 Web Application Credentials
Navigate to **APIs & Services > Credentials**:
1. Click **Create Credentials > OAuth Client ID**.
2. Application Type: **Web application**
3. Name: `StudentApp Web Client`

### Authorized JavaScript Origins
- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

### Authorized Redirect URIs
- Development: `http://localhost:3000/api/integrations/google/callback`
- Production: `https://your-domain.com/api/integrations/google/callback`

Copy the generated **Client ID** and **Client Secret** into your `.env.local` file:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
NEXT_PUBLIC_GOOGLE_REDIRECT_URI="http://localhost:3000/api/integrations/google/callback"
```

---

## 5. Google Picker API Key Configuration
Navigate to **APIs & Services > Credentials**:
1. Click **Create Credentials > API Key**.
2. Edit the API Key settings:
   - Name: `StudentApp Google Picker Key`
   - Application Restrictions: Select **HTTP referrers (web sites)**.
   - Add referrers:
     - Development: `http://localhost:3000/*`
     - Production: `https://your-domain.com/*`
   - API Restrictions: Restrict key to **Google Picker API**.

Copy the API key and Project Number to your `.env.local` file:
```env
NEXT_PUBLIC_GOOGLE_PICKER_API_KEY="AIzaSy..."
NEXT_PUBLIC_GOOGLE_PROJECT_NUMBER="1234567890"
```
