require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
app.use(morgan(":method :url :res[content-length] - :response-time ms :body"));

morgan.token("body", function getBody(req) {
  return JSON.stringify(req.body);
});

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Hello!</h1>");
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => response.json(persons));
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).json({ error: "Person not found" });
      }
    })
    .catch((error) => next(error));
});

app.get("/api/info", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      const numPersons = persons.length;
      const currentDate = new Date();
      response.send(
        `<p> Phonebook has info for ${numPersons} people </p><p>${currentDate}</p>`,
      );
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      console.log(`Deleted ${result}`);
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "Name is missing",
    });
  }
  if (persons.some((p) => p.name === body.name)) {
    return response.status(400).json({
      error: "Name must be unique",
    });
  }
  if (!body.number) {
    return response.status(400).json({
      error: "Number is missing",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((newPerson) => {
      console.log(`NewPerson: ${newPerson}`);
      response.json(newPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  console.log(`Person: ${body.name}, ${body.number}, ${body.id}`);

  if (!body.number) {
    return response.status(400).json({
      error: "Number is missing",
    });
  }

  const updatedPerson = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, updatedPerson, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "Unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "Malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(unknownEndpoint);
app.use(errorHandler);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
