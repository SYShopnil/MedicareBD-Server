//Upload single file with extension filter
const fs = require("fs")
 
const singleImageUploader = (file, extension, fileName) => {
    let config = {
        dataUrl: process.env.SERVER_URL || `http://localhost:3030`, //set the default data url
        saveDirectory: `${__dirname}/../public`, //set the save directory of the data
        fileName //set the file name
    }
 
    const myFile = file //store the file here
    const acceptedExtension = extension //store the extension what we accepted
    const {base64, size} = myFile //get the data from my data
    const dataExtension = base64.split(';')[0].split('/')[1]  //get the extension of my data 
    const myBase64Data = base64.split(';base64,')[1] //get the base 64 data of my data
    const myFileName = `${config.fileName}${+new Date()}.${dataExtension}` //set the file new name
    const myDataUrl = `${config.dataUrl}/${myFileName}` //set the data new data url
 
    //check the file formate is valid or not
    const isValidExtension = acceptedExtension.find(val => val == dataExtension)
    const saveDirectory = `${config.saveDirectory}/${myFileName}`
    if(isValidExtension){
        fs.writeFile( saveDirectory , myBase64Data, {encoding: "base64"}, (err) => {
            if(err) {
                console.log(err);
            }else{
                console.log("File added successfully");
            }
        }) //save the data into public folder
        return{
            fileAddStatus: true,
            extensionValidation: true,
            fileUrl:  myDataUrl
        }
    }else{
        console.log("hello I am from else");
        return{
            extensionValidation: false,
            fileUrl: null,
            fileAddStatus: false
        }
    }
}
 
module.exports = singleImageUploader