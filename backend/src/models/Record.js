import mongoose from 'mongoose';
const schema=new mongoose.Schema({type:{type:String,required:true,index:true},data:{type:mongoose.Schema.Types.Mixed,default:{}},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}},{timestamps:true});
schema.index({type:1,createdAt:-1}); export default mongoose.model('Record',schema);
