# ANFI-backend.

## Setup

  - Require Node >= 16.x for ipfs lib
  - Have npm and make
  - Have docker and docker-compose
#### Step 1
```
npm i
```


#### Step 2
Create ``.env`` file
```
cp .env.example .env
```



#### Step 3
Generate app key
```
adonis key:generate
```



#### Step 4
Edit .env file to config environment

``Config Database``
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_DATABASE=your_database_name
```

``Config Redis Queue``
```
REDIS_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
KUE_CONNECTION=kue
```

#### Step 5

Create database in your MySQL

And fill ``your_database_name`` to ``.env`` file

```
DB_DATABASE=your_database_name
```

#### Step 6: Run Migrations

Run the following command to run startup migrations.

```js
adonis migration:run
```

#### Step 7: Run development server
```js
adonis serve --dev
```

Default port running in ``8456``

You can change in ``.env`` file:
```
PORT=8456
```

#### Step 8: Check API Working

Access to check API Working:
```
http://localhost:8456
```

Result:
```
It's working
```


## Add a new Admin user
#### Step 1: Update infor for admin user

```
  update wallet_address, username in file app/database/seeds/AdminUserSeeder.js

```
#### Step 2: Run seeder
```js
adonis seed
```

Enjoy and Finish !!!


