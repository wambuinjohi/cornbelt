import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

interface VisitorData {
  page_url: string;
  previous_page: string | null;
  timestamp: string;
  user_agent: string;
  device_type: string;
  screen_resolution: string;
  screen_width: number;
  screen_height: number;
  browser_language: string;
  timezone: string;
  timezone_offset: number;
  referrer: string;
  connection_type: string;
  memory: string;
  processor_cores: number;
  platform: string;
  session_id: string;
  geolocation_latitude: number | null;
  geolocation_longitude: number | null;
  geolocation_accuracy: number | null;
  viewport_width: number;
  viewport_height: number;
  color_depth: number;
  pixel_depth: number;
  do_not_track: string | null;
  local_time: string;
  ip_address: string | null;
}

const getDeviceType = (): string => {
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return /tablet|ipad|android/i.test(ua) ? "Tablet" : "Mobile";
  }
  return "Desktop";
};

const getBrowserInfo = (): string => {
  const ua = navigator.userAgent;
  let browser = "Unknown";

  if (/Edge|Edg/i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Opera|OPR/i.test(ua)) browser = "Opera";
  else if (/MSIE|Trident/i.test(ua)) browser = "IE";

  return browser;
};

const getOSInfo = (): string => {
  const ua = navigator.userAgent;
  let os = "Unknown";

  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Macintosh/i.test(ua)) os = "MacOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";

  return os;
};

const getConnectionType = (): string => {
  if ("connection" in navigator) {
    const connection = (navigator as any).connection;
    return connection?.effectiveType || "Unknown";
  }
  return "Unknown";
};

const getProcessorCores = (): number => {
  if ("hardwareConcurrency" in navigator) {
    return navigator.hardwareConcurrency || 1;
  }
  return 1;
};

const getDeviceMemory = (): string => {
  if ("deviceMemory" in navigator) {
    return `${(navigator as any).deviceMemory}GB`;
  }
  return "Unknown";
};

const generateSessionId = (): string => {
  const stored = sessionStorage.getItem("visitor_session_id");
  if (stored) return stored;

  const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem("visitor_session_id", sessionId);
  return sessionId;
};

const getGeolocation = (): Promise<{
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
}> => {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve({ latitude: null, longitude: null, accuracy: null });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      () => {
        resolve({ latitude: null, longitude: null, accuracy: null });
      },
      { timeout: 5000, enableHighAccuracy: false }
    );
  });
};

const fetchIPAddress = async (): Promise<string | null> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json", {
      method: "GET",
    });
    const data = await response.json();
    return data.ip || null;
  } catch {
    return null;
  }
};

export const useVisitorTracking = () => {
  const location = useLocation();
  const previousPageRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string>(generateSessionId());

  useEffect(() => {
    const trackVisitor = async () => {
      const now = new Date();
      const currentPage = `${location.pathname}${location.search}`;

      const geolocation = await getGeolocation();
      const ipAddress = await fetchIPAddress();

      const visitorData: VisitorData = {
        page_url: currentPage,
        previous_page: previousPageRef.current,
        timestamp: now.toISOString(),
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
        screen_resolution: `${screen.width}x${screen.height}`,
        screen_width: screen.width,
        screen_height: screen.height,
        browser_language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezone_offset: now.getTimezoneOffset(),
        referrer: document.referrer || "direct",
        connection_type: getConnectionType(),
        memory: getDeviceMemory(),
        processor_cores: getProcessorCores(),
        platform: navigator.platform,
        session_id: sessionIdRef.current,
        geolocation_latitude: geolocation.latitude,
        geolocation_longitude: geolocation.longitude,
        geolocation_accuracy: geolocation.accuracy,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        color_depth: screen.colorDepth,
        pixel_depth: screen.pixelDepth,
        do_not_track: navigator.doNotTrack || null,
        local_time: now.toLocaleString(),
        ip_address: ipAddress,
      };

      sendVisitorData(visitorData);
      previousPageRef.current = currentPage;
    };

    trackVisitor();
  }, [location]);
};

const sendVisitorData = async (data: VisitorData) => {
  try {
    const url = new URL("https://cornbelt.co.ke/api.php");
    url.searchParams.append("table", "visitor_tracking");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Failed to track visitor. Status:", response.status, "Error:", responseData?.error || "Unknown error");
      return;
    }

    if (responseData.error) {
      console.error("API Error:", responseData.error);
    }
  } catch (error) {
    console.error("Error tracking visitor:", error instanceof Error ? error.message : String(error));
  }
};
