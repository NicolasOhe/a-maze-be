import request from "supertest"
import { app } from "../../dist/app"

describe("GET /login", function () {
  const agent = request.agent(app)

  it("returns an error if unauthorized", (done) => {
    agent
      .get("/maze")
      .expect(401)
      .expect((res) => res.body.errors.length)
      .end(done)
  })

  it("logs in", function (done) {
    agent
      .post("/login")
      .send({ username: "test", password: "password1234" })
      .expect(200)
      .end(function (err, res) {
        console.log(res.body)
        done()
      })
  })

  it("opens maze", function (done) {
    agent
      .get("/maze")
      .expect(200)
      .end(function (err, res) {
        console.log(res.body)
        done()
        if (err) throw err
      })
  })
})
