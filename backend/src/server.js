import 'dotenv/config';import express from 'express';import mongoose from 'mongoose';import bcrypt from 'bcryptjs';import {MongoMemoryServer} from 'mongodb-memory-server';import cors from 'cors';import helmet from 'helmet';import morgan from 'morgan';import rateLimit from 'express-rate-limit';import {createServer} from 'node:http';import {Server} from 'socket.io';import authRoutes from './routes/auth.js';import taskRoutes from './routes/tasks.js';import recordRoutes from './routes/records.js';import User from './models/User.js';
const app=express(),httpServer=createServer(app);const clientOrigins=(process.env.CLIENT_URL||'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:5176,http://127.0.0.1:5177').split(',').map(v=>v.trim()).filter(Boolean);const isAllowedLocalOrigin=(origin)=>{if(!origin)return true;try{const {hostname,protocol,port}=new URL(origin);const allowedHosts=['localhost','127.0.0.1','::1'];if(allowedHosts.includes(hostname))return true;if(hostname.startsWith('10.')||hostname.startsWith('192.168.')||hostname.startsWith('172.'))return true;return clientOrigins.includes(origin);}catch{return false;}};const corsOptions={origin:(origin,callback)=>{if(isAllowedLocalOrigin(origin)){callback(null,true);return;}callback(new Error(`CORS origin not allowed: ${origin}`));},credentials:true};const io=new Server(httpServer,{cors:{origin:(origin,callback)=>{if(isAllowedLocalOrigin(origin)){callback(null,true);return;}callback(new Error(`Socket CORS origin not allowed: ${origin}`));},methods:['GET','POST','PATCH','DELETE'],credentials:true}});app.set('io',io);app.use(helmet());app.use(cors(corsOptions));app.use(express.json({limit:'1mb'}));app.use(morgan('dev'));app.use('/api',rateLimit({windowMs:15*60*1000,limit:300,standardHeaders:true,legacyHeaders:false,message:{message:'Too many requests. Please try again later.'}}));app.use('/api/auth',rateLimit({windowMs:15*60*1000,limit:200,standardHeaders:true,legacyHeaders:false,message:{message:'Too many login attempts. Please wait a moment and try again.'}}),authRoutes);app.use('/api/tasks',taskRoutes);app.use('/api/records',recordRoutes);app.get('/api/health',(req,res)=>res.json({status:'ok',service:'Collaborative Task Manager API'}));app.use((req,res)=>res.status(404).json({message:'API endpoint not found.'}));app.use((err,req,res,next)=>{console.error(err);if(err.name==='ValidationError')return res.status(400).json({message:err.message});if(err.code===11000)return res.status(409).json({message:'A record with that unique value already exists.'});res.status(500).json({message:process.env.NODE_ENV==='production'?'An unexpected server error occurred.':err.message||'Server error.'});});
async function seedDemoUsers(){
  const demoUsers = [
    { name: 'Morgan Manager', email: 'manager@example.com', role: 'Manager' },
    { name: 'Taylor User', email: 'user@example.com', role: 'User' },
    { name: 'Dev Patel', email: 'developer@example.com', role: 'Developer' },
    { name: 'Quinn QA', email: 'qa@example.com', role: 'QA Tester' },
  ];

  for (const user of demoUsers) {
    const exists = await User.findOne({ email: user.email });
    if (!exists) {
      await User.create({
        ...user,
        passwordHash: await bcrypt.hash('Demo1234!', 12),
        active: true,
      });
    }
  }

  console.log('Seeded demo users for login and task workflows.');
}

async function connectDatabase(){const configuredUri=process.env.MONGODB_URI?.trim();if(configuredUri){try{await mongoose.connect(configuredUri);console.log(`Connected to MongoDB at ${configuredUri}`);return;}catch(error){const isLocalDefault=configuredUri.includes('127.0.0.1')||configuredUri.includes('localhost');if(!isLocalDefault){throw error;}console.warn(`Primary MongoDB connection failed (${error.message}). Falling back to in-memory MongoDB.`);}}
const mongoServer=await MongoMemoryServer.create();const mongoUri=mongoServer.getUri();await mongoose.connect(mongoUri);console.log(`Connected to in-memory MongoDB at ${mongoUri}`);}
const port=Number(process.env.PORT)||5001;connectDatabase().then(async()=>{await seedDemoUsers(); httpServer.listen(port,()=>console.log(`API running on http://localhost:${port}`));}).catch(e=>{console.error('MongoDB connection failed:',e.message);process.exit(1)});io.on('connection',socket=>{socket.on('join-user',id=>socket.join(`user:${id}`));});
