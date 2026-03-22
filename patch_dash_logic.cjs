const fs = require('fs');
const file = './src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const [dashboardData')) {
  const insert = "  const { currentProject } = useProject();\n  const [dashboardData, setDashboardData] = useState<any>({ logs: [], progress: 0, blocks: 0, pending: 0, total: 0 });\n\n  useEffect(() => {\n    if (!currentProject) return;\n    const fetchDashboard = async () => {\n      try {\n        const resLogs = await fetch('http://localhost:3000/api/platform/projects/' + currentProject.id + '/logs');\n        let logs = [];\n        if (resLogs.ok) logs = await resLogs.json();\n        setDashboardData({ logs, progress: 0, blocks: 0, pending: 0, total: 0 });\n      } catch (e) { console.error('Error fetching dashboard log:', e); }\n    };\n    fetchDashboard();\n  }, [currentProject]);";
  
  content = content.replace("const { currentProject } = useProject();", insert);
  content = content.replace(/const recentActivity\s*=\s*\[[\s\S]*?\];/, '');
  content = content.replace(/recentActivity\.map/g, '(dashboardData.logs.length ? dashboardData.logs : []).map');
  content = content.replace(/activity\.user/g, "activity.action");
  content = content.replace(/activity\.action/g, "activity.description");
  content = content.replace(/activity\.time/g, "new Date(activity.createdAt).toLocaleDateString()");
  
  if (!content.includes("import { useState, useEffect } from 'react';")) {
     content = content.replace("import React from 'react';", "import React, { useState, useEffect } from 'react';");
     content = content.replace("import { Play, ", "import { useState, useEffect } from 'react';\nimport { Play, ");
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log('patched Dashboard Logic');
} else { console.log('already patched dashboard logic'); }
