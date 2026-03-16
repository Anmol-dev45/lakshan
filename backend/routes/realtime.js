"use strict";
const WebSocket = require("ws");

const AZURE_ENDPOINT = (
  process.env.AZURE_OPENAI_ENDPOINT || "https://nexalaris-tech.openai.azure.com"
).replace(/\/$/, "");
const REALTIME_DEPLOYMENT = process.env.REALTIME_MODEL || "gpt-realtime-1.5";
const REALTIME_API_VERSION =
  process.env.REALTIME_API_VERSION || "2024-10-01-preview";
const REALTIME_VOICE = process.env.REALTIME_VOICE || "alloy";

const REALTIME_URL = [
  `${AZURE_ENDPOINT.replace(/^http/, "ws")}/openai/realtime`,
  `?api-version=${REALTIME_API_VERSION}`,
  `&deployment=${REALTIME_DEPLOYMENT}`,
].join("");

const SYSTEM_PROMPT = `You are a real-time health triage assistant for rural Nepal.
Listen to patient symptoms and respond verbally with:
1. Urgency level (emergency / urgent / routine)
2. Brief likely cause in simple language
3. Immediate action the patient should take
4. Whether they need to visit a doctor or hospital

Keep responses under 30 seconds. Speak clearly and compassionately.
If symptoms sound life-threatening, say so immediately and direct them to emergency services.
Always end every response with: "Please consult a licensed doctor for proper diagnosis."
You may respond in Nepali or English based on what the patient uses.`;

function setupRealtimeProxy(httpServer) {
  const wss = new WebSocket.Server({
    server: httpServer,
    path: "/api/realtime",
  });

  wss.on("error", (err) => {
    console.error("[Realtime] WebSocket server error:", err.message);
  });

  wss.on("connection", (clientWs) => {
    console.log("[Realtime] Client connected");

    let azureReady = false;
    const azureOpenTimeout = setTimeout(() => {
      if (azureReady) return;
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: "error",
            message:
              "Azure realtime connection timeout. Check endpoint/network and try again.",
          }),
        );
        clientWs.close();
      }
    }, 12000);

    if (!process.env.AZURE_API_KEY) {
      clientWs.send(
        JSON.stringify({
          type: "error",
          message:
            "Realtime not configured: missing AZURE_API_KEY in backend .env",
        }),
      );
      clientWs.close();
      return;
    }

    const azureWs = new WebSocket(REALTIME_URL, {
      headers: {
        "api-key": process.env.AZURE_API_KEY,
        "OpenAI-Beta": "realtime=v1",
      },
    });

    azureWs.on("unexpected-response", (_req, res) => {
      const status = res?.statusCode ?? "unknown";
      const statusText = res?.statusMessage ?? "unexpected response";
      const message = `Azure realtime handshake failed (${status} ${statusText}). Check deployment '${REALTIME_DEPLOYMENT}', api-version '${REALTIME_API_VERSION}', and endpoint '${AZURE_ENDPOINT}'.`;
      console.error("[Realtime]", message);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: "error", message }));
        clientWs.close();
      }
    });

    azureWs.on("open", () => {
      azureReady = true;
      clearTimeout(azureOpenTimeout);
      console.log("[Realtime] Azure connected — configuring session");
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: "proxy.azure.open" }));
      }
      azureWs.send(
        JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: SYSTEM_PROMPT,
            voice: REALTIME_VOICE,
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              silence_duration_ms: 700,
            },
          },
        }),
      );
    });

    // Azure → browser: forward all events
    azureWs.on("message", (msg) => {
      if (clientWs.readyState === WebSocket.OPEN) clientWs.send(msg);
    });

    // Browser → Azure: forward audio chunks and events
    clientWs.on("message", (msg) => {
      if (azureWs.readyState === WebSocket.OPEN) azureWs.send(msg);
    });

    clientWs.on("close", () => {
      console.log("[Realtime] Client disconnected");
      clearTimeout(azureOpenTimeout);
      if (azureWs.readyState !== WebSocket.CLOSED) azureWs.close();
    });

    azureWs.on("error", (err) => {
      clearTimeout(azureOpenTimeout);
      console.error("[Realtime] Azure error:", err.message);
      if (clientWs.readyState === WebSocket.OPEN)
        clientWs.send(JSON.stringify({ type: "error", message: err.message }));
    });

    azureWs.on("close", (code, reason) => {
      clearTimeout(azureOpenTimeout);
      if (clientWs.readyState === WebSocket.OPEN) {
        const reasonText = Buffer.isBuffer(reason)
          ? reason.toString("utf8").trim()
          : String(reason || "").trim();

        if (code !== 1000 || reasonText) {
          const message = reasonText
            ? `Realtime closed (${code}): ${reasonText}`
            : `Realtime closed unexpectedly (code ${code}).`;
          clientWs.send(
            JSON.stringify({
              type: "error",
              message,
            }),
          );
        }
        clientWs.close();
      }
    });
  });

  return wss;
}

module.exports = { setupRealtimeProxy };
