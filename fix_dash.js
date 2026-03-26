const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

if (!code.includes('import { useState, useEffect }')) {
  code = code.replace(
    "import { useNavigate } from 'react-router-dom';",
    "import { useState, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';",
  );
}

if (!code.includes('const [dashboardData,')) {
  code = code.replace(
    'const { projectMode, projectName } = useProject();',
    "const { projectMode, projectName, currentProject } = useProject();\n  const [dashboardData, setDashboardData] = useState({ logs: [], progress: 0, blocks: 0, pending: 0, total: 0 });\n\n  useEffect(() => {\n    if (!currentProject) return;\n    const fetchDashboard = async () => {\n      try {\n        const resLogs = await fetch((import.meta.env.VITE_API_URL || '') + '/api/platform/projects/' + currentProject.id + '/logs');\n        let logs = [];\n        if (resLogs.ok) logs = await resLogs.json();\n        setDashboardData({ logs, progress: 0, blocks: 0, pending: 0, total: 0 });\n      } catch (e) { console.error('Error fetching dashboard data:', e); }\n    };\n    fetchDashboard();\n  }, [currentProject]);",
  );
}

fs.writeFileSync('src/pages/Dashboard.tsx', code, 'utf8');
console.log('Fixed Dashboard.tsx definitions');

