const mongoose = require('mongoose')

const uri = 'mongodb+srv://Admin:vVN-yhP-j6b-BMd@cluster0.0qaa9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
console.log('mongoose connecting...');
mongoose.connect(
    uri,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    },
    (err:string) => {
        if (err) {
            throw Error(err);
        }
    }
);