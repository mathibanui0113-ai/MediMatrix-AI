export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported in this browser.");
  }

  return navigator.serviceWorker.register("/sw.js");
}

export async function enableNotifications(userId) {
  const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";
  if (!("Notification" in window) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported in this browser.");
  }

  if (!userId) {
    throw new Error("Please log in again.");
  }

  if (!window.isSecureContext) {
    throw new Error("Notifications require HTTPS or localhost.");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Please allow notification permission.");
  }

  const registration = await registerServiceWorker();
  await navigator.serviceWorker.ready;

  const keyResponse = await fetch(
    `${API_BASE_URL}/api/notifications/public-key`
  );

  if (!keyResponse.ok) {
    throw new Error("Could not load the notification public key.");
  }

  const { publicKey } = await keyResponse.json();

  if (!publicKey) {
    throw new Error("Notification public key is missing.");
  }

  const base64 = publicKey
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  const applicationServerKey = Uint8Array.from(
    atob(padded),
    (character) => character.charCodeAt(0)
  );

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  const response = await fetch(
  `${API_BASE_URL}/api/notifications/subscribe`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      subscription,
    }),
  }
);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not save subscription.");
  }

  return data;
}