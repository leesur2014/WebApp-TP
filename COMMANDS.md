## Some commands

* Install babel (a JavaScript compiler): 

    `npm install --save-dev babel-cli babel-preset-es2015 babel-preset-stage-0`

* body-parser: parse incoming request bodies in a middleware before your handlers

    Link: [body parser](https://github.com/expressjs/body-parser)
    
    `npm install --save body-parser`

* install [nodemon](https://www.npmjs.com/package/nodemon): a real-time error monitoring, 
alerting and analytics tool for developers

    `npm install nodemon`
    
* connect to the psql database

    `  psql "sslmode=verify-full sslrootcert=server-ca.pem \
           sslcert=client-cert.pem sslkey=client-key.pem \
           hostaddr=104.196.2.236 \
           host=named-idiom-184419:you-draw-i-guess \
           port=5432 \
           user=postgres dbname=postgres"`