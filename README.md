# knex-mocker

Mocks knex for testing purposes. Copies database tables from existing schema into a testing schema and allows the table to be seeded. Setup and teardown happens by making function calls. Currently only tested on mysql and postgres. 

#API

```javascript
import mock from 'knex-mocker';
import { knexDB } from './db';

mock(knexDB.client.config, (err, knex) => {
    if (err) throw err;
	knex.remove((err) => {
    });
});
```


.remove(callback) - removes mock database, extended from knex.