exports.dbConfig = {
    server: 'localhost',
    database: "db-voogle",
    user: "sa",
    password: "123456",
    port: 1433,
    requestTimeout: 300000,
    connectionTimeout: 300000,
    driver: "tedious",
    //stream: false,
    options: { encrypt: false, enableArithAbort: false, instanceName: 'SQLEXPRESS' },
    pool: { max: 100, min: 0, idleTimeoutMills: 300000 },
  };
