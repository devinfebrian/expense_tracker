const express = require('express');
const morgan = require('morgan');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(express.json());

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`WealthFlow API running at http://localhost:${PORT}`);
});
