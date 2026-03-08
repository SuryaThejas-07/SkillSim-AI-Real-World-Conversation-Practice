import { getAIResponse } from "@/lib/openai";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const testAPIs = async () => {
  console.log("🧪 Starting API Connection Tests...\n");

  // Test 1: AI API (OpenAI or compatible provider)
  const apiBase = import.meta.env.VITE_OPENAI_API_BASE;
  const provider = apiBase?.includes("groq") ? "Groq" : apiBase?.includes("openai") ? "OpenAI" : "Custom Provider";
  
  console.log(`📡 Testing ${provider}...`);
  try {
    const testResponse = await getAIResponse(
      { name: "Test", category: "interviews", personality: "Professional" },
      []
    );
    if (testResponse && testResponse.length > 0) {
      console.log(`✅ ${provider}: Connected successfully`);
      console.log(`   Response: "${testResponse.substring(0, 50)}..."`);
    } else {
      console.warn(`⚠️ ${provider}: Connected but no response`);
    }
  } catch (error) {
    console.error(`❌ ${provider}: Connection failed`);
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Test 2: Firebase Auth
  console.log("\n📡 Testing Firebase Auth...");
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log("✅ Firebase Auth: User logged in");
      console.log(`   User: ${currentUser.email}`);
    } else {
      console.log("✅ Firebase Auth: Connected (no user logged in - this is OK)");
    }
  } catch (error) {
    console.error("❌ Firebase Auth: Connection failed");
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Test 3: Firebase Firestore
  console.log("\n📡 Testing Firebase Firestore...");
  try {
    // Try to read a test document (won't exist, but tests connection)
    const testDocRef = doc(db, "test", "connection-test");
    await getDoc(testDocRef);
    console.log("✅ Firebase Firestore: Connected successfully");
  } catch (error) {
    console.error("❌ Firebase Firestore: Connection failed");
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log("\n✨ API Connection Tests Complete!\n");
};

// Run tests on app startup in development
if (import.meta.env.DEV) {
  console.log("Development mode detected - API tests available");
  console.log('Run "window.testAPIs()" in browser console to test connections');
  (window as any).testAPIs = testAPIs;
}

export default testAPIs;
