
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    

    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (error) {
        reject(new Error('Invalid JSON format'));
      }
    });
    
    req.on('error', (error) => {
      reject(error);
    });
  });
}

module.exports = parseBody;