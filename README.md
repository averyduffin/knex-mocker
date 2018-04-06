# knex-mocker

Mocks knex for testing purposes. Copies database tables from existing schema into a testing schema and allows the table to be seeded. Setup and teardown happens by making function calls. Currently only tested on mysql and postgres. 

#API

```javascript
import { mock } from 'knex-mocker';
import { db, mdb } from './../../src/db';

mock(db.client.config, (err, knexDB) => {
    if (err) throw err;
	knexDB.remove();
});
```