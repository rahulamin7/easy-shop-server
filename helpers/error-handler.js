function errorHandler(err, req, res, next){
    
    if(err.name === 'UnauthorizedError'){
        //jwt Authernication Error
    return res.status(401).json({message:'The user is not authorized'})
    }
    if(err.name === 'ValidationError'){
        //Validation  Error
        return res.status(401).json({message:err})
    }
    //default to 500 server Error
    return res.status(500).json(err)
}
module.exports = errorHandler;