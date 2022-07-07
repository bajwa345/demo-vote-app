exports.dbConfig = {
    server: 'voogle.database.windows.net',
    database: "dbvoogle",
    user: "usman",
    password: "Zxcv@1234",
    port: 1433,
    requestTimeout: 300000,
    connectionTimeout: 300000,
    driver: "tedious",
    //stream: false,
    //options: { encrypt: false, enableArithAbort: false, instanceName: 'SQLEXPRESS' },
    options: { encrypt: true, enableArithAbort: false },
    pool: { max: 900, min: 0, idleTimeoutMills: 300000 },
  };
