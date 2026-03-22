const fs = require('fs');
const file = './src/components/layout/TeamPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const [teamMembers, setTeamMembers] = useState')) {
content = content.replace(
  "const [status, setStatus] = useState<'online' | 'busy' | 'offline'>('online');",
  "const [status, setStatus] = useState<'online' | 'busy' | 'offline'>('online');\n  const [teamMembers, setTeamMembers] = useState<any[]>([]);\n\n  useEffect(() => {\n    const fetchMembers = async () => {\n      if (!currentProject) return;\n      try {\n        const response = await fetch(http://localhost:3000/api/platform/projects//members);\n        if (response.ok) {\n          const data = await response.json();\n          setTeamMembers(data.map((m: any) => ({\n            id: m.id.toString(),\n            name: m.name,\n            role: m.role || 'Member',\n            avatar: https://ui-avatars.com/api/?name=&background=random,\n            status: 'online'\n          })));\n        }\n      } catch (error) {\n        console.error('Error fetching members:', error);\n      }\n    };\n    fetchMembers();\n  }, [currentProject]);"
);

content = content.replace(/const teamMembers\s*=\s*\[[\s\S]*?\];/, '');
fs.writeFileSync(file, content, 'utf8');
console.log('patched TeamPanel');
}
