# BeSpectacled

![banner](https://zupimages.net/up/22/13/qnjm.jpg)

<!-- This project uses Symfony with API Platform and Vue.js. -->

### Installation

The installation can be done using Docker Compose. You just have to execute the following command :

```bash
docker compose up -d --build
```

To install the project, please run the following command.

```bash
docker compose exec -it php bash /var/www/api/installation.sh
```
To generate JWT Key:
```bash
$ docker compose exec -it php openssl genrsa -out config/jwt/private.pem -aes256 4096
$ docker compose exec -it php openssl rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem
```
In case first openssl command forces you to input password use following to get the private key decrypted:

```bash
$ docker compose exec -it php openssl rsa -in config/jwt/private.pem -out config/jwt/private2.pem
$ docker compose exec -it php mv config/jwt/private.pem config/jwt/private.pem-back
$ docker compose exec -it php mv config/jwt/private2.pem config/jwt/private.pem
```

If you want to deploy your application on a domain other than localhost, modify the following line in api/.env.local.php

```php
// 'CORS_ALLOW_ORIGIN' => '^https?://(localhost|127\\.0\\.0\\.1)(:[0-9]+)?$',
'CORS_ALLOW_ORIGIN' => '^https?://(sub.domain.ext)(:[0-9]+)?$',
```

### Usage

The API is available at the following address : `http://localhost/api`

The front application is available at the following address : `http://localhost:8080`

### Debug
* Get token: `curl -X POST -H "Content-Type: application/json" http://localhost:80/api/login -d '{"email":"user1@root.com","password":"Password123"}'`