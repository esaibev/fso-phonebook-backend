const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

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
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.get("/api/info", (request, response) => {
  const numPersons = persons.length;
  const currentDate = new Date();
  response.send(
    `<p> Phonebook has info for ${numPersons} people </p><p>${currentDate}</p>`,
  );
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const generateId = () => {
    return Math.floor(Math.random() * 100000 + 1).toString();
  };

  const person = request.body;

  if (!person.name) {
    response.status(400).json({
      error: "Name is missing",
    });
    return;
  }
  if (persons.some((p) => p.name === person.name)) {
    response.status(400).json({
      error: "Name must be unique",
    });
    return;
  }
  if (!person.number) {
    response.status(400).json({
      error: "Number is missing",
    });
    return;
  }

  person.id = generateId();
  persons = persons.concat(person);
  console.log("Persons now:", persons);
  response.json(person);
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
