module.exports = (req, res) => {
  res.json({ message: 'Simple API works!', timestamp: new Date().toISOString() });
};
