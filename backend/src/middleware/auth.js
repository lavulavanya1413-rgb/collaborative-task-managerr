import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function protect(req,res,next){try{const h=req.headers.authorization;if(!h?.startsWith('Bearer '))return res.status(401).json({message:'Please sign in to continue.'});const payload=jwt.verify(h.slice(7),process.env.JWT_SECRET);const user=await User.findById(payload.sub);if(!user||!user.active)return res.status(401).json({message:'Session is invalid. Please sign in again.'});req.user=user;next();}catch(e){return res.status(401).json({message:'Invalid or expired session.'});}}
export const allowRoles=(...roles)=>(req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({message:'Your role does not have permission for this action.'});
