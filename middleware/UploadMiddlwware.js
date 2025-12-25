import multer from 'multer'
import path from 'path'

const strorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },  
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        console.log(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`)
    }
})


//file filter function
const checkFileTypeFilter = (req,file,cb)=>{
    if(!file){
        return cb(new Error('Please upload a file'),false)
    }
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png"){
        return cb(null,true)
    }else{
        return cb(new Error("Only jpeg and png files are allowed , this is not an image file ."), false)
    }
}


//multer midleware

export default multer({
    storage:strorage,
    limits:{fileSize : 2048*2048},
    fileFilter: checkFileTypeFilter 
})