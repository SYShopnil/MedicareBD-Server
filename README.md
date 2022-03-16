# MediCareBD

This is a medical management project. Where client can make for a appointment to the doctor. Doctor can prescripe and many more service.

## Key Technologies

**Client-Side:** React js, Redux, BootStrap

**Server-Side:** Node JS, Express JS

**Database:** MongoDB (with ODM mongoose)

## Key Roles

- Admin
- Doctor
- Patient

## API INFO

Total API => 58

API- TYPE => REST FULL API

## Key Features

- Doctor, Patient and Admin all have individual registration process with different type of data.
- Full Login System inclduing forgot password and also reset password functionality.
- Patient can take a appointment of a Doctor.
- Doctor can prescriped to a Patient all CRUD operation has been applied.
- Patient can see the respective prescription in a PDF format and also able to download it as a PDF format.
- After get a appointment of a Patient have to pay the respective doctor's fees.
- User can pay the fee by using any Local Bangaldeshi gateway including internation card (ex: MasterCard, VISA) by using SSLCOMMERZ payment gateway.
- Authentic user can book a Ambulance.
- Authentic user can take the blood bank service.
- Authentic user can take the Oxygen service. User can take oxygen cylender by book it online.

## Run Locally

Clone the project

```bash
  git clone https://github.com/SYShopnil/MedicareBD-Server.git
```

Go to the project directory

```bash
  cd MedicareBD-Server
```

Install dependencies

```bash
  npm install || npm i
```

Start the server

```bash
  npm run dev
```

## Installation

Install my-project with npm

```bash
  npm install || npm i
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

**`PORT`** //it will be the server side port

**`URL`** //it wil be the mongodb database local or cloud server link.

**`JWT_SECURE_CODE`** // it will be the JSON WEB TOKEN'S security code

**`HOST_EMAIL`** // it will be a valid email for nodeMailer host mail. to use this you should have enable low security of you gmail.

**`HOST_PASSWORD`** // it will be a valid email password for nodeMailer host mail. to use this you should have enable low security of you gmail.

**`SENDER_EMAIL`** //it will be a valid email.

**`MESSAGE_FOR_VERIFICATION `** //In the forgot password user need to verify so a message of verification.

**`SSLCOMMERZ_STORE_ID `** //Provided SSLCOMMERZ payement gateway's SSLCOMMERZ_STORE_ID

**`SSLCOMMERZ_STORE_PASSWORD `** //Provided SSLCOMMERZ payement gateway's SSLCOMMERZ_STORE_PASSWORD

**`SERVER_URL `** //put your server URL only the base one ex: "http://localhost:3030"

**`CLIENT_URL `** //put your client URL only the base one ex: "http://localhost:3000"

## Documentation

[API- Doc](https://drive.google.com/file/d/1ZajO0tCNXyW1QrjjC3TF6n5oauuQ4rNW/view?usp=sharing)

## Support

For support, info@visionmash.com .
