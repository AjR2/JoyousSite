// Test endpoint in root directory
export default function handler(req, res) {
  res.status(200).json({
    message: 'Root endpoint works!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}
