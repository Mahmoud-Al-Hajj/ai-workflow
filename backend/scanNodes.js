import fs from 'fs';
import path from 'path';

const nodesDir = './nodes';
const nodeInfo = [];

function scanNodes(dir, prefix = '') {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
        if (item.isDirectory()) {
            scanNodes(path.join(dir, item.name), prefix + item.name + '/');
        } else if (item.name.endsWith('.node.ts')) {
            const nodeName = item.name.replace('.node.ts', '');
            const nodeType = prefix.toLowerCase() + nodeName.toLowerCase();
            
            nodeInfo.push({
                name: nodeName,
                type: `n8n-nodes-base.${nodeType}`,
                displayName: nodeName,
                category: prefix.split('/')[0] || 'Other'
            });
        }
    }
}

scanNodes(nodesDir);

console.log(`Found ${nodeInfo.length} nodes!`);
console.log('First 10:');
nodeInfo.slice(0, 10).forEach(node => {
    console.log(`- ${node.displayName} (${node.type})`);
});

fs.writeFileSync('realNodes.json', JSON.stringify(nodeInfo, null, 2));
console.log('Saved to realNodes.json');
