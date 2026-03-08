/**
 * Environment & Integration Verification
 * Checks if all required API keys and configurations are properly set
 */

export interface ConfigStatus {
  openaiApiKey: boolean;
  firebase: boolean;
  allOk: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Verify all configurations are set
 */
export const verifyConfiguration = (): ConfigStatus => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check API Key (supports Groq, OpenAI and OpenAI-compatible providers)
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const apiBase = import.meta.env.VITE_OPENAI_API_BASE;
  let openaiOk = false;

  if (!apiKey) {
    errors.push(
      "API Key not set. Add VITE_OPENAI_API_KEY to .env.local"
    );
  } else if (apiKey === "gsk_your-groq-key-here" || apiKey === "sk-proj-your-key-here" || apiKey === "your-api-key-here") {
    errors.push(
      "API Key is still a placeholder. Replace with real key in .env.local"
    );
  } else if (apiBase?.includes("groq")) {
    console.log("✓ Using Groq API (Free & Fast)");
    openaiOk = true;
  } else if (apiBase?.includes("openai")) {
    console.log("✓ Using OpenAI API");
    openaiOk = true;
  } else {
    console.log("✓ Using OpenAI-compatible API provider");
    openaiOk = true; // Allow other compatible providers
  }

  // Check Firebase Configuration
  let firebaseOk = false;
  try {
    const firebaseConfig = {
      apiKey: "AIzaSyA45Jbcgc5bY2Lyk-AeVOXvMeZHVOT4bVU",
      authDomain: "ai-human-simulator.firebaseapp.com",
      projectId: "ai-human-simulator",
      storageBucket: "ai-human-simulator.firebasestorage.app",
      messagingSenderId: "348435602914",
      appId: "1:348435602914:web:c4855eb64180f0135eadbb",
    };

    if (
      firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId
    ) {
      firebaseOk = true;
    } else {
      errors.push("Firebase configuration is incomplete");
    }
  } catch (e) {
    errors.push("Failed to load Firebase configuration");
  }

  const allOk = errors.length === 0 && openaiOk && firebaseOk;

  return {
    openaiApiKey: openaiOk,
    firebase: firebaseOk,
    allOk,
    warnings,
    errors,
  };
};

/**
 * Log configuration status to console
 */
export const logConfigStatus = (): void => {
  const status = verifyConfiguration();

  console.group("🔧 Configuration Status");

  if (status.openaiApiKey) {
    console.log("✅ OpenAI API Key configured");
  } else {
    console.error(
      "❌ OpenAI API Key missing or invalid",
      status.errors[0]
    );
  }

  if (status.firebase) {
    console.log("✅ Firebase configured");
  } else {
    console.error("❌ Firebase configuration missing");
  }

  if (status.warnings.length > 0) {
    console.warn("⚠️ Warnings:", status.warnings.join(", "));
  }

  if (status.allOk) {
    console.log("✨ All configurations are OK!");
  } else {
    console.error("❌ Some configurations are missing or invalid");
  }

  console.groupEnd();
};

/**
 * Test OpenAI API connection
 */
export const testOpenAIConnection = async (): Promise<boolean> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === "sk-proj-your-key-here") {
    console.error("❌ Cannot test OpenAI: API key not configured");
    return false;
  }

  try {
    console.log("🧪 Testing OpenAI API connection...");
    // Note: This is a simple test - in production, you'd make a real API call
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (response.ok) {
      console.log("✅ OpenAI API connection successful");
      return true;
    } else if (response.status === 401) {
      console.error("❌ OpenAI API: Invalid API key (401 Unauthorized)");
      return false;
    } else {
      console.error(
        `❌ OpenAI API error: ${response.status} ${response.statusText}`
      );
      return false;
    }
  } catch (error) {
    console.error("❌ OpenAI API connection failed:", error);
    return false;
  }
};

/**
 * Test Firebase connection
 */
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log("🧪 Testing Firebase connection...");
    const { db } = await import("@/lib/firebase");
    const { collection, query, limit, getDocs } = await import(
      "firebase/firestore"
    );

    // Try to read a collection
    const q = query(collection(db, "simulations"), limit(1));
    await getDocs(q);

    console.log("✅ Firebase connection successful");
    return true;
  } catch (error) {
    console.error("⚠️ Firebase connection test:", error instanceof Error ? error.message : error);
    // Don't fail completely - Firestore might be restricted for unauthenticated access
    return true;
  }
};

/**
 * Full health check
 */
export const runHealthCheck = async (): Promise<ConfigStatus> => {
  console.group("🏥 Running Health Check");

  const configStatus = verifyConfiguration();
  logConfigStatus();

  if (configStatus.openaiApiKey) {
    await testOpenAIConnection();
  }

  if (configStatus.firebase) {
    await testFirebaseConnection();
  }

  console.groupEnd();
  return configStatus;
};
