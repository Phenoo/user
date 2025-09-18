"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, CheckCircle, XCircle } from "lucide-react";

interface QuotaInfo {
  quotaUsed: number;
  quotaLimit: number;
  percentage: number;
  status: "good" | "warning" | "critical";
}

export function YouTubeQuotaMonitor() {
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkQuota = async () => {
    setLoading(true);
    setError(null);

    try {
      // This is a simplified check - in reality, you'd need to implement
      // quota tracking in your backend or use Google Cloud Monitoring API
      const response = await fetch("/api/youtube/quota-status");

      if (response.ok) {
        const data = await response.json();
        setQuotaInfo(data);
      } else {
        // Fallback: Show estimated usage based on local storage
        const estimatedUsage = getEstimatedUsage();
        setQuotaInfo(estimatedUsage);
      }
    } catch (err) {
      // Fallback to estimated usage
      const estimatedUsage = getEstimatedUsage();
      setQuotaInfo(estimatedUsage);
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedUsage = (): QuotaInfo => {
    // Get usage from localStorage (basic tracking)
    const storedUsage = localStorage.getItem("youtube-api-usage");
    const usage = storedUsage
      ? JSON.parse(storedUsage)
      : { requests: 0, date: new Date().toDateString() };

    // Reset if it's a new day
    if (usage.date !== new Date().toDateString()) {
      localStorage.setItem(
        "youtube-api-usage",
        JSON.stringify({ requests: 0, date: new Date().toDateString() })
      );
      usage.requests = 0;
    }

    const quotaUsed = usage.requests * 100; // Each search costs ~100 units
    const quotaLimit = 10000; // Default daily limit
    const percentage = (quotaUsed / quotaLimit) * 100;

    let status: "good" | "warning" | "critical" = "good";
    if (percentage >= 90) status = "critical";
    else if (percentage >= 70) status = "warning";

    return {
      quotaUsed,
      quotaLimit,
      percentage,
      status,
    };
  };

  const getStatusIcon = () => {
    if (!quotaInfo) return null;

    switch (quotaInfo.status) {
      case "good":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    if (!quotaInfo) return "";

    switch (quotaInfo.status) {
      case "good":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
  };

  const getStatusText = () => {
    if (!quotaInfo) return "";

    switch (quotaInfo.status) {
      case "good":
        return "Quota usage is normal";
      case "warning":
        return "Quota usage is high";
      case "critical":
        return "Quota usage is critical";
    }
  };

  useEffect(() => {
    checkQuota();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4" />
          YouTube API Quota Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Checking quota...</span>
          </div>
        ) : quotaInfo ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Daily Usage</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <Badge className={getStatusColor()}>
                    {quotaInfo.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{quotaInfo.quotaUsed.toLocaleString()} units used</span>
                  <span>{quotaInfo.quotaLimit.toLocaleString()} limit</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      quotaInfo.status === "critical"
                        ? "bg-red-500"
                        : quotaInfo.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(quotaInfo.percentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {quotaInfo.percentage.toFixed(1)}% used
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              {getStatusText()}
            </div>

            {quotaInfo.status === "critical" && (
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs">
                <strong>Action Required:</strong> You've exceeded your daily
                quota. Consider requesting a quota increase or wait until
                tomorrow.
              </div>
            )}

            {quotaInfo.status === "warning" && (
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                <strong>Warning:</strong> You're approaching your daily quota
                limit. Consider optimizing your API usage.
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            Unable to check quota status
          </div>
        )}

        <Button
          onClick={checkQuota}
          disabled={loading}
          size="sm"
          variant="outline"
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-2" />
              Refresh
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>
            <strong>Quota Costs:</strong>
          </div>
          <div>• Search: 100 units per request</div>
          <div>• Video details: 1 unit per request</div>
          <div>• Daily limit: 10,000 units (default)</div>
        </div>
      </CardContent>
    </Card>
  );
}
