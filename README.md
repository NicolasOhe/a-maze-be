# A maze backend

A node.js express server written in TypeScript and using prisma as ORM. Communication is done via JSON messages.

This application is the result of a coding challenge to be submitted within one week.

Main features:

- user registration
- login
- save mazes provided by logged in user
- display list of mazes saved by logged in user
- return path of minimum or maximum length from provided entrance to detected exit.

## Limitations

Most features could be implemented. However some limitations were introduced.

For the maze:
The maximum size of a grid is 10x10.
The maximum number of iterations accomplished in order to find a valit path is limited to one million.
The reason of these limitations is to prevent a crash of the application when the provided grid does not contain walls, which causes an exponential increase of the number of possibilities to evaluate.

For the login:
The session is saved on the client in the form of a JSON web token (JWT) with an expiration time. The benefit of this method is that we could split the application into separate services while still beeing able to restrict access. The downside of the current implementation is that there is no logout logic, nor the possibility to refresh the access token, therefore a new user login is required after expiration of the token.

I did not find the time to cover the code with tests within the granted time frame. A prototype is present in the "testing" branch, however it should not be consired in the evaluation.

## prisma cheatsheet

Run migration:
npx prisma migrate dev

Update Prisma client:
npx prisma generate

Inspect database:
npx prisma studio
