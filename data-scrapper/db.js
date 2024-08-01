import mongoose from 'mongoose';

const DB_LIVE_URL =
    'mongodb+srv://mroot:pass9859@cluster-0.ntw5yfz.mongodb.net/docconnect';

const instance = await mongoose.connect(DB_LIVE_URL);
const db = instance.connection.db;

export default db;
