const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');
const PORTS = process.env.PORTS || 5000;

app.use(cors());
app.use(express.json());

app.post("/questions", async (req, res) => {
    try {
        const {id, number, question, answer, options} = req.body;
        const newQuestion = await pool.query("INSERT INTO questions (id, number, question, answer, options) VALUES($1, $2, $3, $4) RETURNING *",
        [id, number, question, answer, options]
        );
        res.json(newQuestion.rows[0])
      } catch(err){
          console.error(err.message)
      }
});

app.get('/', (req, res) => {
    res.send("👋🏿🌍")
});

app.get('/questions', async (req, res) => {
    try {
        const allQuestions = await pool.query("SELECT * FROM questions");
        res.json(allQuestions.rows)
    } catch (err) {
        console.error(err.message)
    }
});

app.get('/search', async (req, res) => {
    const searchTerm = req.query.term;
    const client = await pool.connect();
    const result = await client.query(
        `SELECT * FROM questions WHERE question LIKE '%${searchTerm}%' ORDER BY question ASC`
    );
    client.release();
    res.send(result.rows);
});

app.put('/questions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { number, question, answer, options } = req.body;
        const updateQuestion = await pool.query("UPDATE question SET number = $1, question = $2, answer = $3, options = $4 WHERE id = $5",
        [number, question, answer, options]
    );     
        res.json("Question successfully updated!")
    } catch (err){
        console.error(err.message)
    }
})

app.delete("/questions/:id", async(req, res) => {
    try {
        const { id } = req.params;
        const deleteQuestion = await pool.query("DELETE FROM question WHERE id= $1",
        [id]
        );
        res.json("Question successfully deleted!")
    } catch (err) {
        console.log(err.message)
    }
})

app.listen(PORTS, ()=> {
    console.log(`Server is live on port ${PORTS}`)
})