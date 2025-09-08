"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";

const PomodoroPage = () => {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [task, setTask] = useState("Chọn công việc"); // Default task

  useEffect(() => {
    let interval = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      clearInterval(interval as any);
      // You could add a notification or sound here when timer finishes
      alert("Time's up! Take a break.");
      setIsActive(false); // Stop the timer
      setTime(25 * 60); // Reset for next session
    }
    return () => clearInterval(interval as any);
  }, [isActive, time]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const formatTime = (seconds: any) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Basic UI elements - you'd style this much more thoroughly with CSS/Tailwind
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f8f8f8", // Light background matching your image
        fontFamily: "Arial, sans-serif",
        color: "#333",
      }}
    >
      <Head>
        <title>Pomodoro Timer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "30px",
        }}
      >
        <h1 style={{ fontSize: "2em", marginBottom: "20px", color: "#555" }}>
          Pomodoro
        </h1>

        <button
          onClick={() => alert("Feature to select task coming soon!")}
          style={{
            padding: "12px 25px",
            borderRadius: "30px",
            border: "1px solid #ddd",
            backgroundColor: "#fff",
            fontSize: "1em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
          }}
        >
          {/* Simple pencil icon placeholder */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          {task}
        </button>

        <div
          style={{
            position: "relative",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            backgroundColor: "#ffebee", // Light pink background for the outer circle
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
          }}
        >
          {/* Inner circle for the timer */}
          <div
            style={{
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              backgroundColor: "#ffcdd2", // Slightly darker pink for the inner circle
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3em",
              fontWeight: "bold",
              color: "#d32f2f", // Darker red for the time text
            }}
          >
            {formatTime(time)}
          </div>
        </div>

        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          {/* Music icon button */}
          <button
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            }}
            onClick={() => alert("Music feature coming soon!")}
          >
            {/* Simple music icon placeholder */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </button>

          {/* Play/Pause button */}
          <button
            onClick={toggleTimer}
            style={{
              padding: "15px 40px",
              borderRadius: "30px",
              border: "none",
              backgroundColor: "#222", // Dark background for the main button
              color: "white",
              fontSize: "1.2em",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            {isActive ? (
              <>
                {/* Pause icon */}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                Tạm dừng
              </>
            ) : (
              <>
                {/* Play icon */}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z"></path>
                </svg>
                Bắt đầu tập trung
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default PomodoroPage;
