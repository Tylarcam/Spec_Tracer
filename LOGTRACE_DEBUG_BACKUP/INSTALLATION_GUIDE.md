
# Quick Installation Guide

## 1. Create New Project
```bash
npm create vite@latest my-logtrace-debug -- --template react-ts
cd my-logtrace-debug
```

## 2. Install Dependencies
```bash
# Copy package.json from backup and run:
npm install
```

## 3. Copy Core Files
- Copy all files from `core-files/src/` to your `src/` directory
- Copy `tailwind.config.ts` to project root
- Replace `index.css` with backup version

## 4. Setup Supabase
- Create new Supabase project
- Run SQL from `supabase/schema.sql`
- Update `src/integrations/supabase/client.ts` with your credentials

## 5. Test Core Flow
1. Start dev server: `npm run dev`
2. Enter "example.com" in URL input
3. Press Enter key
4. Verify navigation to `/debug?site=https://example.com`
5. Confirm iframe loads and LogTrace overlay appears

## Key Features Preserved
✅ Enter key triggers navigation from home page  
✅ URL validation and iframe loading  
✅ Element highlighting with cyan borders  
✅ Cross-origin iframe communication  
✅ AI debugging with OpenAI integration  
✅ Authentication and credits system  
✅ Dark theme with green-to-cyan gradients  
✅ Mobile responsive design  

See `README.md` and `REBUILD_INSTRUCTIONS.md` for complete details.
