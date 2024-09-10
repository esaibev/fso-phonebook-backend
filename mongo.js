const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("Give password as an argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fso:${password}@fso-cluster.0s107.mongodb.net/phonebook?retryWrites=true&w=majority&appName=fso-cluster`;

mongoose.connect(url);

const personShema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personShema);

// Listing all persons if only password was provided
if (process.argv.length === 3) {
  Person.find({}).then((persons) => {
    console.log("Phonebook:");
    persons.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
}

// Adding a new person to phonebook
else if (process.argv.length == 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  person.save().then(() => {
    console.log(`Added ${person.name} number ${person.number} to phonebook`);
    mongoose.connection.close();
  });
} else {
  console.log(
    "Please provide the correct arguments: node mongo.js <password> [name] [number]",
  );
  mongoose.connection.close();
}
