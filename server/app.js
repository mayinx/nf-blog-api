const express = require("express");
const db = require("./lib/db");

/*
  We create an express app calling
  the express function.
*/
const app = express();

/*
  We setup middleware to:
  - parse the body of the request to json for us
  https://expressjs.com/en/guide/using-middleware.html
  */

/* HELPERS / MIDDLEWARE */

function log_request_info(req, res, next) {
  console.log("--------------------------------------");
  console.log(`--- Incoming ${req.method} request`);
  console.log("--- ContenType", req.header("Content-Type"));
  console.log("--- user-agent", req.header("user-agent"));
  console.log("--- Authorization", req.header("Authorization"));
  console.log("--- protocol: ", req.protocol);
  console.log("--- hostname: ", req.hostname);
  console.log("--- url: ", req.url);
  console.log("--- body: ", req.body);
  console.log("--- params: ", req?.params);
  console.log("--- id: ", req?.params?.id);

  console.log("--------------------------------------");
  next();
}

app.use(express.json());
app.use(log_request_info);

/*
  Endpoint to handle GET requests to the root URI "/"
*/
app.get("/", (req, res) => {
  res.json({
    "/articles": "read and create new articles",
    "/articles/:id": "read, update and delete an individual article",
  });
});

// LIST RESOURCES
// GET http://localhost:4000/articles HTTP/1.1
app.get("/articles", (req, res) => {
  db.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      console.log(error);
      res.status(500);
      res.send("Something went wrong");
    });
});

// CREATE NEW RESOURCE
// POST http://localhost:4000/articles HTTP/1.1
app.post("/articles", (req, res) => {
  db.insert(req.body)
    .then((data) => {
      console.log("asd");
      res.status(201).send(data);
    })
    .catch((error) => {
      console.log(error);
      res.status(500);
      res.send("Something went wrong");
    });
});

// FIND_RESOURCE
// GET http://localhost:4000/articles/:id HTTP/1.1
app.get("/articles/:id", (req, res) => {
  const { id } = req.params;

  db.findById(id)
    .then((data) => {
      if (!data) {
        res.status(404).end();
        return;
      }

      res.send(data);
    })
    .catch(() => {
      res.status(500).send();
    });
});

// UPDATE RESOURCE
// PATCH http://localhost:4000/articles/:id HTTP/1.1
app.patch("/articles/:id", (req, res) => {
  db.updateById(req.params.id, req.body)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        throw new Error("Resource Not found");
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(404).send(error.message || "Resource Not Found");
    });
});

// DELETE RESOURCE
// DELETE http://localhost:4000/articles/:id HTTP/1.1
app.delete("/articles/:id", (req, res) => {
  db.deleteById(req.params.id, req.body)
    .then(() => {
      res.status(204).end();
    })
    .catch(() => {
      res.status(500).end();
    });
});

/*
  We have to start the server. We make it listen on the port 4000
*/
app.listen(4000, () => {
  console.log("Listening on http://localhost:4000");
});
