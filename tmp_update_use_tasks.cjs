const fs = require('fs');

const files = [
  'src/pages/Upcoming.tsx',
  'src/pages/Logbook.tsx',
  'src/pages/Inbox.tsx',
  'src/pages/Someday.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Anytime.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf-8');

  // Add imports if missing
  if (!content.includes('MainLayoutContext')) {
    if (content.includes("import { useOutletContext } from 'react-router-dom';")) {
      content = content.replace("import { useOutletContext } from 'react-router-dom';", "import { useOutletContext } from 'react-router-dom';\nimport { MainLayoutContext } from '../layout/MainLayout';");
    } else {
      content = "import { useOutletContext } from 'react-router-dom';\nimport { MainLayoutContext } from '../layout/MainLayout';\n" + content;
    }
  }

  // Inject activeProjectId extraction
  if (!content.includes('activeProjectId')) {
    if (content.includes('const { openEditTaskModal } = useOutletContext<MainLayoutContext>();')) {
       content = content.replace(
         'const { openEditTaskModal } = useOutletContext<MainLayoutContext>();', 
         'const { openEditTaskModal, activeProjectId } = useOutletContext<MainLayoutContext>();'
       );
    } else if (content.includes('useOutletContext<MainLayoutContext>();')) {
       content = content.replace(
         /const {(.+?)} = useOutletContext<MainLayoutContext>\(\);/, 
         'const { $1, activeProjectId } = useOutletContext<MainLayoutContext>();'
       );
    } else {
       content = content.replace(/export function (\w+)\(\)\s*\{/, 'export function $1() {\n  const { activeProjectId } = useOutletContext<MainLayoutContext>();');
    }

    // Replace useTasks('view')
    content = content.replace(/useTasks\('([^']+)'\)/, "useTasks('$1', activeProjectId)");
    
    fs.writeFileSync(f, content);
    console.log(`Updated ${f}`);
  }
});
