import { runGoogleCredentialTests } from "./google-credentials";
import { runGoogleScopeTests } from "./google-scopes";

runGoogleScopeTests();
runGoogleCredentialTests();

console.log("✓ Google integration persistence and OAuth tests passed");
