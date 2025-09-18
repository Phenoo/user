# YouTube API Integration Setup

This document explains how to set up the YouTube Data API v3 integration for the student app.

## Prerequisites

1. A Google Cloud Platform account
2. A YouTube Data API v3 API key

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3:
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"

### 2. Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key to only YouTube Data API v3 for security

### 3. Configure Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
```

Replace `your_youtube_api_key_here` with your actual API key.

### 4. Restart Your Development Server

After adding the environment variable, restart your Next.js development server:

```bash
npm run dev
# or
yarn dev
```

## Features

The YouTube integration provides:

- **Course-specific video suggestions**: Automatically finds relevant educational videos based on course name and topics
- **Smart search**: Search for specific topics within YouTube
- **Relevance scoring**: Videos are automatically categorized as "Highly Relevant", "Relevant", or "Somewhat Relevant"
- **Rich video information**: Displays duration, view count, like count, and publication date
- **Responsive design**: Works on desktop and mobile devices
- **Loading states**: Shows skeleton loaders while fetching videos
- **Error handling**: Graceful error handling with retry options

## API Usage

The integration uses the following YouTube Data API v3 endpoints:

- `search`: To find videos based on search queries
- `videos`: To get detailed information about videos (duration, statistics)

## Rate Limits & Quota Management

The YouTube Data API v3 has the following rate limits:

- **Quota cost per request**:
  - Search: 100 units
  - Videos: 1 unit
- **Daily quota**: 10,000 units (default)

This means you can make approximately 100 search requests per day with the default quota.

### Quota Optimization Features

The app includes several quota-saving features:

1. **Caching**: Search results are cached for 30 minutes to avoid duplicate API calls
2. **Optimized Queries**: Reduced from multiple searches to 1-2 targeted searches per course
3. **Quota Monitor**: Real-time tracking of your daily quota usage
4. **Smart Loading**: Only loads videos when needed

### Managing Quota Exceeded Errors

If you get a "quota exceeded" error:

1. **Check Quota Usage**: Use the built-in quota monitor to see your current usage
2. **Request Increase**: Go to Google Cloud Console → APIs & Services → Quotas
3. **Wait for Reset**: Quota resets daily at midnight Pacific Time
4. **Optimize Usage**: The app now uses caching and optimized queries to reduce quota consumption

## Troubleshooting

### Common Issues

1. **"YouTube API key not configured" error**:
   - Make sure you've added `NEXT_PUBLIC_YOUTUBE_API_KEY` to your `.env.local` file
   - Restart your development server after adding the environment variable

2. **"YouTube API error: 403"** (Most Common):
   This error has several possible causes:

   **a) API Key Issues:**
   - API key is invalid, expired, or malformed
   - API key doesn't have permission to access YouTube Data API v3
   - API key restrictions are too strict (IP, domain, or API restrictions)

   **b) API Not Enabled:**
   - YouTube Data API v3 is not enabled in your Google Cloud project
   - Go to Google Cloud Console → APIs & Services → Library → Search "YouTube Data API v3" → Enable

   **c) Quota Exceeded:**
   - Daily quota limit exceeded (default: 10,000 units per day)
   - Each search request costs 100 units, video details cost 1 unit
   - Check usage in Google Cloud Console → APIs & Services → Quotas

   **d) Billing Issues:**
   - Billing is not enabled for your Google Cloud project
   - Some APIs require billing to be enabled even for free tier usage
   - Go to Google Cloud Console → Billing → Link a billing account

   **e) Project Issues:**
   - Wrong Google Cloud project selected
   - Project doesn't have the necessary permissions
   - Project is suspended or disabled

3. **"YouTube API error: 400"**:
   - Check if your search query is valid
   - Ensure you're not sending empty or invalid parameters
   - Verify the API request format is correct

4. **"YouTube API error: 429"**:
   - Rate limit exceeded
   - Too many requests in a short time period
   - Wait before making more requests

### Step-by-Step Debugging

1. **Check Environment Variable:**

   ```bash
   # In your .env.local file
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_actual_api_key_here
   ```

2. **Verify API Key Format:**
   - Should start with "AIza" followed by 35 characters
   - Example: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Test API Key Manually:**

   ```bash
   curl "https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&maxResults=1&key=YOUR_API_KEY"
   ```

4. **Check Google Cloud Console:**
   - Go to APIs & Services → Credentials
   - Verify your API key is listed and active
   - Check if any restrictions are applied

5. **Enable Required APIs:**
   - YouTube Data API v3
   - (Optional) YouTube Analytics API if you need analytics data

6. **Check Quota Usage:**
   - Go to APIs & Services → Quotas
   - Look for "YouTube Data API v3"
   - Check daily quota usage

7. **Enable Billing:**
   - Go to Billing → Link a billing account
   - Even free tier usage may require billing to be enabled

### Debug Component

The app includes a built-in debug component that will appear when there's an error. It will:

- Check if your API key is properly set
- Test the API connection
- Show detailed error information
- Provide specific troubleshooting steps

### Getting Help

If you encounter issues:

1. Check the browser console for error messages
2. Verify your API key is correctly set in the environment variables
3. Check the Google Cloud Console for API usage and quota information
4. Review the [YouTube Data API v3 documentation](https://developers.google.com/youtube/v3)

## Security Notes

- Never commit your API key to version control
- Consider restricting your API key to specific domains/IPs in production
- Monitor your API usage to avoid unexpected charges
- Use environment variables to store sensitive information
