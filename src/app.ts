import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express, { Express, Request, Response, json } from 'express';
import router from './routes';
import CustomError from './utils/CustomError';
import ejs from 'ejs';
import path from 'path';

config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(json());
app.use(cors());
app.use(cookieParser());

// add publuc folder as static folder
app.use(express.static('public'));

// set ejs
app.engine('html', ejs.renderFile);

// set view engine
const viewsPath = path.join(__dirname, '../public/email-templates');
app.set('views', viewsPath);

// welcome message
app.get('/', (request: Request, response: Response) => {
    response.json({
        success: true,
        message: 'Welcome to DocConnect',
    });
});

// use routes
app.use('/api/v1', router);

// catch 404 and forward to error handler
app.use((request: Request, response: Response, next: any) => {
    next(new CustomError(404, 'Route not found'));
});

// add error handler
app.use((err: CustomError, request: any, response: any, next: any) => {
    console.log('in global', err);
    let message: any = err.getMessage();
    response.status(err.getStatusCode() || 500).json({
        success: false,
        message: message || 'Something went wrong',
    });
});

app.listen(PORT, () => console.log(`app running on port ${PORT}`));

export default app;
