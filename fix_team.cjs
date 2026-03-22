const fs = require('fs');
let code = fs.readFileSync('src/components/layout/TeamPanel.tsx', 'utf8');

if (!code.includes('const [teamMembers,')) {
  code = code.replace('const { projectMode } = useProject();', 'const { projectMode, currentProject } = useProject();\n  const [teamMembers, setTeamMembers] = useState([]);\n\n  useEffect(() => {\n    const fetchMembers = async () => {\n      if (!currentProject) return;\n      try {\n        const response = await fetch(\'http://localhost:3000/api/platform/projects/\' + currentProject.id + \'/members\');\n        if (response.ok) {\n          const data = await response.json();\n          setTeamMembers(data.map((m) => ({\n            id: m.id.toString(),\n            name: m.name,\n            role: m.role || \'Member\',\n            avatar: \'https://ui-avatars.com/api/?name=\' + encodeURIComponent(m.name) + \'&background=random\',\n            status: \'online\'\n          })));\n        }\n      } catch (error) {\n        console.error(\'Error fetching members:\', error);\n      }\n    };\n    fetchMembers();\n  }, [currentProject]);');
}

fs.writeFileSync('src/components/layout/TeamPanel.tsx', code, 'utf8');
console.log('Fixed TeamPanel.tsx definitions');

