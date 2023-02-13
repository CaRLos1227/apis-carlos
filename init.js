const { spawn } = require('child_process');

function start_process() {
  const application = spawn('node', ['server.js']);

  application.stdout.on('end', () => {
    console.log('aplicação caiu reiniciando...');
    start_process();
  });

  application.stdout.on('data', terminal => {
    console.log(terminal.toString().trim());
  });
}
start_process();