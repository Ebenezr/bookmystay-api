# Esoko Ecommerce Admin

## Author: Bukosia Ebenezar
## Project Description

this is a admin page for ecommerce site to enable user to view products , edit existing products, delete products and add new products.


## SCREENSHOTS

#### ![image](https://user-images.githubusercontent.com/37300065/222905573-ed5f94bd-0d1e-47a6-8afe-4a349de5db0a.png)


## Technologies
### Front end
* Nextjs(Typescript)
* Tailwindcss
* Zustand(State manager)

### Back end

* Nodejs(Typescript)
* Prisma
* Postgresql


## Features
- User can View all products
- user can add new products
- user can edit an existing product
- user can delete a product
- user can view company stats
## How to set up and run

### Dependencies

- yarn
- node 16
- npm
- docker

## setup

### setup

#### Client (React)

clone the repo using the command

```shell
git clone https://github.com/Ebenezr/ecommerce-client-app.git
```

change directory using command

```shell
cd ecommerce-client-app
```

open project in vscode text editor

```shell
code .
```

install dependancies

```shell
yarn install
```

run front end

```shell
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


#### API (Nodejs)

clone the repo using the command

```shell
git clone https://github.com/Ebenezr/ecommerce-api.git
```

change directory using command

```shell
cd ecommerce-api
```

open project in vscode texteditor

```shell
code .
```

install dependancies

```shell
yarn install
```

run postgresql and redis database

```shell
docker-compose up -d
```
run api server

```shell
yarn dev
```

---

## Copyright

Copyright[c](2023)[bukosia ebenezar]

---

## Contact Information

* Email : ebenezarbukosia@gmail.om

---

## [License](LICENSE)

MIT License
Copyright (c) 2022 Bukosia Ebenezar
