const express = require('express');
const app = express();
const dotenv = require('dotenv');
const PORT = 3000;
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const cookieParser = require('cookie-parser');
const connectDb = require('./config/db');

dotenv.config({ path: './config/.env' })

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);


app.listen(PORT || 5000, () => {
    connectDb();
    console.log(`Server listening on Port: ${PORT}`);
});