# Merge Conflict TODOs: What Was Lost from Old Version

## Highest Priority

### 1. Card-Based Terminal UI (TabbedTerminal.tsx)
- **Lost:** The old version used a Card-based UI for the terminal, with a different layout and button arrangement.
- **Prompt to Re-Apply:**
  > Refactor the TabbedTerminal component to use a Card-based UI for the terminal, with export and close buttons styled as in the old version. Restore the Card, CardHeader, and CardContent structure if needed.

### 2. Auth Logic in Extension (LogTraceExtension.tsx)
- **Lost:** The old version had inline Supabase auth logic (React.useEffect for session, handleSignUp, handleSignIn, etc.) instead of the new useExtensionAuth hook abstraction.
- **Prompt to Re-Apply:**
  > Replace the useExtensionAuth hook in LogTraceExtension.tsx with inline Supabase auth logic, including React.useEffect for session, handleSignUp, handleSignIn, and handleSignInWithGitHub functions as in the old version.

### 3. Extra Imports and Navigation in Landing Page (Landing.tsx)
- **Lost:** The old version imported Card, CardHeader, CardContent, CardTitle, CardDescription, MousePointer, Shield, Terminal, and useNavigate/useAuth, and had a secondary CTA for context-transform navigation.
- **Prompt to Re-Apply:**
  > Add back the Card, CardHeader, CardContent, CardTitle, CardDescription, MousePointer, Shield, Terminal imports, and useNavigate/useAuth hooks to Landing.tsx. Restore the secondary CTA button for navigating to /context-transform with the appropriate styling and Sparkles icon.

## Medium Priority

### 4. Button/Tab Styling Differences (TabbedTerminal.tsx)
- **Lost:** The old version had different button and tab styling (e.g., outline/ghost variants, color classes).
- **Prompt to Re-Apply:**
  > Review the button and tab styling in TabbedTerminal.tsx and restore the outline/ghost variants and color classes from the old version if preferred.

## Low Priority

### 5. Notification/Toast Hooks (TabbedTerminal.tsx)
- **Lost:** The old version imported and possibly used useToast and useNotification hooks.
- **Prompt to Re-Apply:**
  > Re-add the useToast and useNotification hooks to TabbedTerminal.tsx if you want to restore toast/notification functionality for terminal actions.

---

**How to Use:**
- Each prompt above can be copy-pasted as a new task for an AI assistant or developer to re-apply the lost changes if needed.
- Review this list after the merge to decide if any old features or UI elements should be restored. 



terminal changes: 

This is an example of the old way. 

