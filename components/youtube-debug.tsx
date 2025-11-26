"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface YouTubeDebugProps {
  apiKey?: string;
  onTestAPI?: () => Promise<void>;
}

export function YouTubeDebug({ apiKey, onTestAPI }: YouTubeDebugProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: "success" | "error" | "warning" | null;
    message: string;
    details?: any;
  } | null>(null);

  const testAPIKey = async () => {
    if (!apiKey) {
      setTestResult({
        status: "error",
        message:
          "No API key found. Please set YOUTUBE_API_KEY in your environment variables.",
      });
      return;
    }

    setIsTesting(true);

    setTestResult(null);

    try {
      // Test with a simple search query
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&maxResults=1&key=${apiKey}`
      );

      const data = await response.json();

      if (!response.ok) {
        setTestResult({
          status: "error",
          message: `API Error (${response.status}): ${data.error?.message || "Unknown error"}`,
          details: data.error,
        });
      } else {
        setTestResult({
          status: "success",
          message: "API key is working correctly!",
          details: {
            quotaUsed: data.pageInfo?.totalResults || "Unknown",
            itemsFound: data.items?.length || 0,
          },
        });
      }
    } catch (error) {
      setTestResult({
        status: "error",
        message: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = () => {
    switch (testResult?.status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (testResult?.status) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          YouTube API Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Key Status */}
        <div className="space-y-2">
          <h4 className="font-medium">API Key Status</h4>
          <div className="flex items-center gap-2">
            {apiKey ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">API key is set</span>
                <Badge variant="outline" className="text-xs">
                  {apiKey.substring(0, 10)}...
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">API key not found</span>
              </>
            )}
          </div>
        </div>

        {/* Test Button */}
        <div className="space-y-2">
          <h4 className="font-medium">Test API Connection</h4>
          <Button
            onClick={testAPIKey}
            disabled={isTesting || !apiKey}
            className="w-full"
          >
            {isTesting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test API Key"
            )}
          </Button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Result</h4>
            <div className={`p-3 rounded-lg ${getStatusColor()}`}>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon()}
                <span className="font-medium">{testResult.message}</span>
              </div>
              {testResult.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">
                    Show Details
                  </summary>
                  <pre className="mt-2 text-xs bg-black/10 p-2 rounded overflow-auto">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Common Issues */}
        <div className="space-y-2">
          <h4 className="font-medium">Common 403 Error Causes</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• API key is invalid or expired</li>
            <li>• YouTube Data API v3 is not enabled</li>
            <li>• Daily quota exceeded (10,000 units)</li>
            <li>• API key restrictions are too strict</li>
            <li>• Billing is not enabled for the project</li>
          </ul>
        </div>

        {/* Quick Fixes */}
        <div className="space-y-2">
          <h4 className="font-medium">Quick Fixes</h4>
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <strong>1. Check API Key:</strong> Make sure YOUTUBE_API_KEY is
              set in your .env.local file
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <strong>2. Enable API:</strong> Go to Google Cloud Console → APIs
              & Services → Library → Enable YouTube Data API v3
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <strong>3. Check Quota:</strong> Go to Google Cloud Console → APIs
              & Services → Quotas to see usage
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <strong>4. Enable Billing:</strong> Some APIs require billing to
              be enabled
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
