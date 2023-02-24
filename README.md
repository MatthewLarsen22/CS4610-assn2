# Matthew Larsen CS4610-assn2
This is my backend for a reptile husbandry website I am making for my web dev class.

## Get Started
### Clone the repo
```bash
git clone git@github.com:MatthewLarsen22/CS4610-assn2.git
```
Once cloned you can delete the `.git` folder and reinitialize with your own repo

```bash
rm -rf .git
git init
```
Then create your remote repository and commit and push to it.

### Install the dependencies

With yarn
```bash
yarn
```

With npm
```bash
npm install
```

## Development
### .env
Copy the contents of `.env.example` into a new file called `.env`. You will need to complete the `Encryption Key=` line with your own encryption key. I simply typed out a random combination of letters and numbers for my encryption key.

### Database
Create the database by running
```bash
yarn migrate
```
You will need the re-run this command anytime you make changes to the schema file.

### Running the server
Start the server by running:

With yarn
```bash
yarn dev
```

With npm
```bash
npm run dev
```

## Production
Build the project by running

With yarn
```bash
yarn build
```

With npm
```bash
npm run build
```
