"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { useToast } from "./components/toast";

const generateRandomUsername = () => {
  const adjectives = [
    "Swift",
    "Brave",
    "Clever",
    "Lucky",
    "Mighty",
    "Silent",
    "Cosmic",
    "Neon",
  ];
  const nouns = [
    "Fox",
    "Eagle",
    "Wolf",
    "Hawk",
    "Tiger",
    "Shark",
    "Raven",
    "Phoenix",
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9999);
  return `${adj}${noun}${num}`;
};

type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export default function Home() {
  const [username, setUsername] = useState<string>("");
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [logMessage, setLogMessage] = useState<string>("");
  const [logLevel, setLogLevel] = useState<LogLevel>("info");
  const { showToast } = useToast();

  useEffect(() => {
    const user = generateRandomUsername();
    setUsername(user);

    Sentry.setUser({
      username: user,
      id: crypto.randomUUID(),
    });
  }, []);

  const triggerError = async () => {
    showToast("Triggering error...", "info");

    await Sentry.startSpan(
      {
        name: "trigger-error-action",
        op: "ui.action",
      },
      async () => {
        try {
          throw new Error(
            `Test error triggered by ${username} at ${new Date().toISOString()}`
          );
        } catch (error) {
          Sentry.captureException(error);
          showToast("Error captured and sent to Sentry!", "success");
        }
      }
    );
  };

  const triggerConsecutiveApiCalls = async () => {
    showToast("Triggering consecutive API calls...", "info");

    const results: unknown[] = [];

    // Make 10 sequential API calls
    for (let i = 1; i <= 10; i++) {
      showToast(`Fetching item ${i}/10...`, "info");
      const response = await fetch(`/api/item/${i}`);
      const data = await response.json();
      results.push(data);
    }

    showToast(`Fetched ${results.length} items consecutively`, "success");
  };

  const triggerNPlusOne = async () => {
    showToast("Triggering N+1 API calls...", "info");

    // Fire all 10 API calls simultaneously
    const promises = Array.from({ length: 10 }, (_, i) =>
      fetch(`/api/item/${i + 1}`).then((res) => res.json())
    );

    const results = await Promise.all(promises);

    showToast(
      `N+1 issue triggered: Fetched ${results.length} items simultaneously`,
      "success"
    );
  };

  const submitFeedback = async () => {
    if (!feedbackMessage.trim()) {
      showToast("Please enter feedback message", "error");
      return;
    }

    showToast("Submitting feedback...", "info");

    Sentry.captureFeedback({
      message: feedbackMessage,
      name: username,
      email: `${username.toLowerCase()}@example.com`,
    });

    setFeedbackMessage("");
    showToast("Feedback submitted to Sentry!", "success");
  };

  const sendLog = async () => {
    if (!logMessage.trim()) {
      showToast("Please enter a log message", "error");
      return;
    }

    showToast(`Sending ${logLevel} log...`, "info");

    Sentry.logger[logLevel](logMessage, {
      username,
      timestamp: new Date().toISOString(),
    });

    setLogMessage("");
    showToast(`Log message sent to Sentry!`, "success");
  };

  const triggerLargePayload = async () => {
    showToast("Fetching large payload...", "info");

    const response = await fetch("/api/large-payload");
    const data = await response.json();

    showToast(`Large payload received: ${data.length} items (~1MB)`, "success");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            Sentry Tester
          </h1>
          <p className="text-zinc-400 text-lg">
            Trigger different Sentry issues for testing
          </p>
        </header>

        <div className="mb-8 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-300">
              User:{" "}
              <span className="text-white font-mono">
                {username || "Loading..."}
              </span>
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <section className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <h2 className="text-xl font-semibold text-white mb-2">
              1. Trigger Error
            </h2>
            <p className="text-zinc-400 text-sm mb-4">
              Throws an exception and captures it via Sentry.captureException()
            </p>
            <button
              onClick={triggerError}
              className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
            >
              Trigger Exception
            </button>
          </section>

          <section className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <h2 className="text-xl font-semibold text-white mb-2">
              2. Submit Feedback
            </h2>
            <p className="text-zinc-400 text-sm mb-4">
              Sends user feedback using Sentry.captureFeedback() API
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitFeedback()}
                placeholder="Enter feedback message..."
                className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={submitFeedback}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
              >
                Submit
              </button>
            </div>
          </section>

          <section className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <h2 className="text-xl font-semibold text-white mb-2">
              3. Send Log Message
            </h2>
            <p className="text-zinc-400 text-sm mb-4">
              Sends a log message to Sentry using Sentry.logger API
            </p>
            <div className="flex gap-3">
              <select
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value as LogLevel)}
                className="px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="trace">Trace</option>
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warn</option>
                <option value="error">Error</option>
                <option value="fatal">Fatal</option>
              </select>
              <input
                type="text"
                value={logMessage}
                onChange={(e) => setLogMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendLog()}
                placeholder="Enter log message..."
                className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={sendLog}
                className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
              >
                Send Log
              </button>
            </div>
          </section>

          <section className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <h2 className="text-xl font-semibold text-white mb-2">
              4. Large HTTP Payload
            </h2>
            <p className="text-zinc-400 text-sm mb-4">
              Fetches a ~1MB JSON response to trigger large payload detection
            </p>
            <button
              onClick={triggerLargePayload}
              className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
            >
              Fetch Large Payload
            </button>
          </section>

          <section className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <h2 className="text-xl font-semibold text-white mb-2">
              5. Consecutive API Calls
            </h2>
            <p className="text-zinc-400 text-sm mb-4">
              Makes 10 sequential API calls one after another
            </p>
            <button
              onClick={triggerConsecutiveApiCalls}
              className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
            >
              Trigger Consecutive Calls
            </button>
          </section>

          <section className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <h2 className="text-xl font-semibold text-white mb-2">
              6. Trigger N+1 Issue
            </h2>
            <p className="text-zinc-400 text-sm mb-4">
              Fires 10 API calls simultaneously to simulate an N+1 query pattern
            </p>
            <button
              onClick={triggerNPlusOne}
              className="px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium transition-colors"
            >
              Trigger N+1 Calls
            </button>
          </section>
        </div>

        <footer className="mt-12 pt-8 border-t border-zinc-800">
          <p className="text-zinc-500 text-sm text-center">
            All actions are instrumented with Sentry spans for performance
            monitoring
          </p>
        </footer>
      </div>
    </div>
  );
}
