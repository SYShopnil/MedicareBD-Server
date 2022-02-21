const idGenerator = (userType) => {
    let type 
    let userId

    if(userType.toLowerCase() === "doctor") {
        const getFirstTwoDigit = userType.toUpperCase().split("")
        const firsTwoDigit = getFirstTwoDigit[0] + getFirstTwoDigit[1] + getFirstTwoDigit[2] 
        type = firsTwoDigit
    }else if(userType.toLowerCase() == 'patient') {
        const getFirstTwoDigit = userType.toUpperCase().split("")
        const firsTwoDigit = getFirstTwoDigit[0] + getFirstTwoDigit[1] + getFirstTwoDigit[2] 
        type = firsTwoDigit
    }else if(userType.toLowerCase() == 'admin') {
        const getFirstTwoDigit = userType.toUpperCase().split("")
        const firsTwoDigit = getFirstTwoDigit[0] + getFirstTwoDigit[1] + getFirstTwoDigit[2] 
        type = firsTwoDigit
    }else if(userType.toLowerCase() == 'appointment') {
        const getFirstTwoDigit = userType.toUpperCase().split("")
        const firsTwoDigit = getFirstTwoDigit[0] + getFirstTwoDigit[1] + getFirstTwoDigit[2] 
        type = firsTwoDigit
    }else if(userType.toLowerCase() == 'prescription') {
        const getFirstTwoDigit = userType.toUpperCase().split("")
        const firsTwoDigit = getFirstTwoDigit[0] + getFirstTwoDigit[1] + getFirstTwoDigit[2] 
        type = firsTwoDigit
    }

    //generate 4 digit userId 
    let randomNumberGenerator = ""
    if(userType.toLowerCase() ==  "appointment" || userType.toLowerCase() ==  "prescription"){
         for(let i = 1 ; i<=5; i++ ){
            randomNumberGenerator = Math.floor(Math.random() * 9 + 1) + randomNumberGenerator
        } //generate the random number form appointment
    }else {
         for(let i = 1 ; i<=3; i++ ){
            randomNumberGenerator = Math.floor(Math.random() * 9 + 1) + randomNumberGenerator
        } //generate the random number
    }
   
    userId = type + randomNumberGenerator

    return {
        userId
    }


}

module.exports = idGenerator