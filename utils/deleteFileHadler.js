const fs = require('fs');

const deleteFileHandler = async (fileName) => {
    try{
        let message, deleteStatus
        const deleteFileName = fileName //store the file name what we need to delete  
        const deletePath = `${__dirname}/../public/${deleteFileName}`  //the path where we need to delete the file
        const deleteFilePromise = () => ( //create a promise what delete the existing profile image 
            new Promise((resolve, reject) => {
                fs.unlink(deletePath, function (error){
                    if(error){
                        reject({
                            message: error.message,
                            deleteStatus: false
                        })
                        // reject(error)
                        message = "file has not deleted successfully"
                        deleteStatus = false
                        throw error
                    }else {
                        resolve({
                            message: "file has been deleted successfully",
                            deleteStatus: true
                        })
                        // resolve("bye")
                        message = "file has been deleted successfully"
                        deleteStatus = true
                    }
                })
            })
        )
        const deleteFileResponse = await deleteFilePromise() 
        return deleteFileResponse
    }catch(err) {
        console.log(err);
        return {
            message: err.message,
            deleteStatus: false
        }
    }
}

module.exports = deleteFileHandler;