import {spawn} from 'node:child_process';
const args=process.argv.slice(2);const p=args.indexOf('--port');
const child=spawn(process.execPath,['node_modules/next/dist/bin/next',args.includes('--strictPort')?'start':'dev','--hostname','0.0.0.0','--port',p>=0?args[p+1]:'3000'],{stdio:'inherit'});
process.on('SIGTERM',()=>child.kill('SIGTERM'));process.on('SIGINT',()=>child.kill('SIGINT'));child.on('exit',code=>process.exit(code??0));
